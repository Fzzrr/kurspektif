'use server';

import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { headers } from 'next/headers';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { EMAIL_SENDER } from '@/lib/email';
import { passwordResetEmail } from '@/lib/emailTemplates';
import { BCRYPT_COST } from '@/lib/auth/auth';
import { passwordResetLimiter } from '@/lib/rateLimit';

export type ResetState = { error?: string; message?: string; done?: boolean } | undefined;

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 jam
// Yang disimpan hanya hash-nya: token aktif tidak bisa dipakai walau tabelnya bocor.
const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
const identifierFor = (userId: string) => `password-reset:${userId}`;

async function limited(): Promise<boolean> {
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  return !(await passwordResetLimiter.check(`password-reset:${ip}`)).success;
}

// Jawabannya selalu sama, terdaftar atau tidak — supaya formulir ini tidak bisa
// dipakai untuk mengecek email mana yang punya akun.
const SENT_MESSAGE =
  'Kalau email itu terdaftar, kami sudah mengirim tautan untuk mengatur ulang kata sandi. Cek inbox dan folder spam.';

export async function requestPasswordResetAction(_prev: ResetState, formData: FormData): Promise<ResetState> {
  if (await limited()) return { error: 'Terlalu banyak percobaan. Coba lagi nanti.' };

  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Alamat email tidak valid.' };

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, password: true } });
  if (!user) return { message: SENT_MESSAGE };

  const token = randomBytes(32).toString('base64url');
  const identifier = identifierFor(user.id);
  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: { identifier, token: hashToken(token), expires: new Date(Date.now() + TOKEN_TTL_MS) },
  });

  const link = `${process.env.APP_URL}/atur-ulang-kata-sandi?token=${token}`;
  const sent = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: EMAIL_SENDER,
    to: email,
    ...passwordResetEmail({ email, link, hasPassword: Boolean(user.password) }),
  });
  if (sent.error) {
    console.error('Email atur ulang kata sandi gagal:', sent.error.message);
    return { error: 'Gagal mengirim email. Coba lagi beberapa saat lagi.' };
  }
  return { message: SENT_MESSAGE };
}

export async function resetPasswordAction(_prev: ResetState, formData: FormData): Promise<ResetState> {
  if (await limited()) return { error: 'Terlalu banyak percobaan. Coba lagi nanti.' };

  const token = String(formData.get('token') ?? '');
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');
  if (password.length < 8) return { error: 'Kata sandi minimal 8 karakter.' };
  if (password !== confirm) return { error: 'Konfirmasi kata sandi tidak cocok.' };

  const record = token ? await prisma.verificationToken.findUnique({ where: { token: hashToken(token) } }) : null;
  if (!record || !record.identifier.startsWith('password-reset:')) {
    return { error: 'Tautan tidak valid atau sudah dipakai. Minta tautan baru.' };
  }
  if (record.expires < new Date()) {
    await prisma.verificationToken.deleteMany({ where: { identifier: record.identifier } });
    return { error: 'Tautan sudah kedaluwarsa. Minta tautan baru.' };
  }

  const userId = record.identifier.slice('password-reset:'.length);
  await prisma.user.update({ where: { id: userId }, data: { password: await bcrypt.hash(password, BCRYPT_COST) } });
  await prisma.verificationToken.deleteMany({ where: { identifier: record.identifier } });
  return { done: true };
}
