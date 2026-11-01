'use server';

import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import { auth, signOut, updateSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { EMAIL_SENDER, devLinkFallback } from '@/lib/email';
import { hashToken, newToken } from '@/lib/tokens';
import { emailChangeEmail } from '@/lib/emailTemplates';
import { BCRYPT_COST } from '@/lib/auth';
import { profileUpdateLimiter, passwordChangeLimiter, emailChangeLimiter } from '@/lib/rateLimit';

export type ActionState = { error?: string; success?: string } | undefined;

// Browser mengecilkan foto ke 256×256 sebelum dikirim (~10–40KB base64).
// Foto disimpan di tabel User dan ikut terkirim ke setiap halaman dashboard,
// jadi batas ini sengaja ketat.
const MAX_IMAGE_BYTES = 150_000;
const IMAGE_DATA_URI = /^data:image\/(png|jpeg|webp);base64,/;

export async function updateProfileAction(name: string, image?: string): Promise<ActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: 'Unauthorized' };

  if (!(await profileUpdateLimiter.check(`profile:${userId}`)).success) {
    return { error: 'Terlalu banyak permintaan. Coba lagi sebentar lagi.' };
  }

  const trimmedName = name.trim();
  if (!trimmedName) return { error: 'Nama wajib diisi.' };
  if (trimmedName.length > 100) return { error: 'Nama terlalu panjang.' };

  if (image !== undefined) {
    if (!IMAGE_DATA_URI.test(image)) return { error: 'Format gambar tidak didukung.' };
    if (image.length > MAX_IMAGE_BYTES) return { error: 'Ukuran gambar terlalu besar.' };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { name: trimmedName, ...(image !== undefined && { image }) },
  });

  return undefined;
}

export async function changePasswordAction(
  currentPassword: string,
  newPassword: string,
  confirmNewPassword: string,
): Promise<ActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: 'Unauthorized' };

  if (!(await passwordChangeLimiter.check(`password:${userId}`)).success) {
    return { error: 'Terlalu banyak permintaan. Coba lagi sebentar lagi.' };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  // Cek `password !== null`, BUKAN "apakah akun ini terhubung ke Google" — user
  // kredensial bisa juga menautkan Google tapi tetap punya password sendiri.
  if (!user?.password) {
    return { error: 'Akun ini masuk lewat Google dan tidak punya kata sandi untuk diubah.' };
  }

  const isCorrect = await bcrypt.compare(currentPassword, user.password);
  if (!isCorrect) return { error: 'Kata sandi saat ini salah.' };

  if (newPassword.length < 8) return { error: 'Kata sandi baru minimal 8 karakter.' };
  if (newPassword !== confirmNewPassword) return { error: 'Konfirmasi kata sandi baru tidak cocok.' };

  const hashed = await bcrypt.hash(newPassword, BCRYPT_COST);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  // Perangkat lain keluar otomatis (sidik kata sandi di tokennya tidak cocok lagi);
  // perangkat ini memperbarui sidiknya supaya tetap masuk.
  await updateSession({});

  return { success: 'Kata sandi diperbarui. Perangkat lain yang masuk dengan akun ini sudah dikeluarkan.' };
}

export async function requestEmailChangeAction(newEmail: string): Promise<ActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: 'Unauthorized' };

  if (!(await emailChangeLimiter.check(`email:${userId}`)).success) {
    return { error: 'Terlalu banyak permintaan. Coba lagi nanti.' };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.password) {
    return { error: 'Akun yang masuk lewat Google tidak bisa mengganti email di sini.' };
  }

  const normalized = newEmail.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return { error: 'Alamat email tidak valid.' };
  if (normalized === user.email) return { error: 'Itu sudah email kamu saat ini.' };

  const taken = await prisma.user.findUnique({ where: { email: normalized } });
  if (taken) return { error: 'Email itu sudah dipakai akun lain.' };

  const identifier = `email-change:${userId}`;
  const token = newToken();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 jam
  const link = `${process.env.APP_URL}/konfirmasi-email?token=${token}`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const sent = await resend.emails.send({
    from: EMAIL_SENDER,
    to: normalized,
    ...emailChangeEmail({ link, oldEmail: user.email, newEmail: normalized }),
  });

  const devFallback = sent.error ? devLinkFallback('Konfirmasi email baru', normalized, link, sent.error.message) : false;
  if (sent.error && !devFallback) return { error: 'Gagal mengirim email verifikasi. Coba lagi.' };

  // Hapus token lama dulu supaya cuma satu token aktif per user.
  await prisma.verificationToken.deleteMany({ where: { identifier } });
  // Yang disimpan hanya hash-nya, sama seperti token pendaftaran dan atur ulang kata sandi.
  await prisma.verificationToken.create({ data: { identifier, token: hashToken(token), newEmail: normalized, expires } });

  return { success: `Cek ${normalized} untuk mengonfirmasi perubahan.` };
}
// Hapus akun beserta semua datanya. Alert, watchlist, sesi, dan akun Google
// ikut terhapus lewat onDelete: Cascade; token verifikasi tidak punya relasi,
// jadi dihapus manual.
export async function deleteAccountAction(confirmation: string): Promise<ActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: 'Sesi berakhir. Masuk lagi untuk menghapus akun.' };
  if (confirmation.trim() !== 'HAPUS') return { error: 'Ketik HAPUS untuk mengonfirmasi.' };

  await prisma.verificationToken.deleteMany({
    where: { identifier: { in: [`email-change:${userId}`, `password-reset:${userId}`, `email-verify:${userId}`] } },
  });
  await prisma.user.delete({ where: { id: userId } });
  await signOut({ redirectTo: '/' });
  return undefined;
}
