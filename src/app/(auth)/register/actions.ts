'use server';

import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { EMAIL_SENDER, devLinkFallback } from '@/lib/email';
import { verifyEmailEmail } from '@/lib/emailTemplates';
import { registerLimiter } from '@/lib/rateLimit';
import { BCRYPT_COST } from '@/lib/auth/auth';

export type RegisterState = { error?: string; sentTo?: string } | undefined;

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 jam
// Sama seperti token atur ulang kata sandi: yang disimpan hanya hash-nya.
const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
const identifierFor = (userId: string) => `email-verify:${userId}`;

// Membuat user baru dengan password ter-hash, lalu mengirim tautan verifikasi.
// Akun belum bisa dipakai masuk sampai tautannya diklik: tanpa ini siapa pun
// bisa mendaftarkan email orang lain, dan saat pemilik aslinya masuk lewat
// Google, akunnya tertaut ke akun yang kata sandinya dipegang si pendaftar.
export async function registerUser(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  // Server Action = endpoint publik, jadi tetap perlu rate limit.
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!(await registerLimiter.check(`register:${ip}`)).success) {
    return { error: 'Terlalu banyak percobaan. Coba lagi nanti.' };
  }

  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').toLowerCase().trim();
  const password = String(formData.get('password') ?? '');

  if (!name || !email || !password) return { error: 'Semua kolom wajib diisi.' };
  if (name.length > 100) return { error: 'Nama terlalu panjang.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Alamat email tidak valid.' };
  if (password.length < 8) return { error: 'Kata sandi minimal 8 karakter.' };

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true, password: true, emailVerified: true } });
  // Jawabannya selalu "cek email", terdaftar atau tidak — supaya formulir ini
  // tidak bisa dipakai untuk mengecek email mana yang punya akun. Akun yang
  // sudah aktif (atau akun Google) tidak disentuh dan tidak dikirimi apa pun.
  if (existing && !(existing.password && !existing.emailVerified)) return { sentTo: email };

  const hashed = await bcrypt.hash(password, BCRYPT_COST);
  // Pendaftaran ulang atas akun yang belum diverifikasi menimpa kata sandinya:
  // yang memegang tautan terakhir adalah yang terakhir mendaftar.
  const user = existing
    ? await prisma.user.update({ where: { id: existing.id }, data: { name, password: hashed }, select: { id: true } })
    : await prisma.user.create({ data: { name, email, password: hashed }, select: { id: true } });

  const token = randomBytes(32).toString('base64url');
  const identifier = identifierFor(user.id);
  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: { identifier, token: hashToken(token), expires: new Date(Date.now() + TOKEN_TTL_MS) },
  });

  const link = `${process.env.APP_URL}/verifikasi-email?token=${token}`;
  const sent = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: EMAIL_SENDER,
    to: email,
    ...verifyEmailEmail({ email, link }),
  });
  if (sent.error && devLinkFallback('Verifikasi email', email, link, sent.error.message)) return { sentTo: email };
  if (sent.error) {
    console.error('Email verifikasi gagal:', sent.error.message);
    return { error: 'Gagal mengirim email verifikasi. Coba daftar lagi beberapa saat lagi.' };
  }
  return { sentTo: email };
}

// Dipanggil dari tombol di halaman /verifikasi-email, bukan langsung dari
// tautan: pemindai tautan di layanan email membuka GET otomatis, dan itu tidak
// boleh mengaktifkan akun yang didaftarkan orang lain.
export async function verifyEmailAction(formData: FormData) {
  const token = String(formData.get('token') ?? '');
  const record = token ? await prisma.verificationToken.findUnique({ where: { token: hashToken(token) } }) : null;
  if (!record || !record.identifier.startsWith('email-verify:')) redirect('/verifikasi-email?status=invalid');

  await prisma.verificationToken.deleteMany({ where: { identifier: record.identifier } });
  if (record.expires < new Date()) redirect('/verifikasi-email?status=expired');

  const userId = record.identifier.slice('email-verify:'.length);
  await prisma.user.updateMany({ where: { id: userId }, data: { emailVerified: new Date() } });
  redirect('/verifikasi-email?status=done');
}
