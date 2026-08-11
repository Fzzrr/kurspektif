'use server';

import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BCRYPT_COST } from '@/lib/auth/auth';
import { profileUpdateLimiter, passwordChangeLimiter, emailChangeLimiter } from '@/lib/rateLimit';

export type ActionState = { error?: string; success?: string } | undefined;

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // ~2MB dalam bentuk base64
const IMAGE_DATA_URI = /^data:image\/(png|jpeg|webp);base64,/;

export async function updateProfileAction(name: string, image?: string): Promise<ActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: 'Unauthorized' };

  if (!(await profileUpdateLimiter.check(`profile:${userId}`)).success) {
    return { error: 'Too many requests. Please try again shortly.' };
  }

  const trimmedName = name.trim();
  if (!trimmedName) return { error: 'Name is required.' };
  if (trimmedName.length > 100) return { error: 'Name is too long.' };

  if (image !== undefined) {
    if (!IMAGE_DATA_URI.test(image)) return { error: 'Unsupported image format.' };
    if (image.length > MAX_IMAGE_BYTES) return { error: 'Image is too large.' };
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
    return { error: 'Too many requests. Please try again shortly.' };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  // Cek `password !== null`, BUKAN "apakah akun ini terhubung ke Google" — user
  // kredensial bisa juga menautkan Google tapi tetap punya password sendiri.
  if (!user?.password) {
    return { error: 'This account signs in with Google and has no password to change.' };
  }

  const isCorrect = await bcrypt.compare(currentPassword, user.password);
  if (!isCorrect) return { error: 'Current password is incorrect.' };

  if (newPassword.length < 8) return { error: 'New password must be at least 8 characters.' };
  if (newPassword !== confirmNewPassword) return { error: 'New passwords do not match.' };

  const hashed = await bcrypt.hash(newPassword, BCRYPT_COST);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

  return { success: 'Password updated.' };
}

export async function requestEmailChangeAction(newEmail: string): Promise<ActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: 'Unauthorized' };

  if (!(await emailChangeLimiter.check(`email:${userId}`)).success) {
    return { error: 'Too many requests. Please try again later.' };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.password) {
    return { error: 'Google-linked accounts cannot change their email here.' };
  }

  const normalized = newEmail.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return { error: 'Invalid email address.' };
  if (normalized === user.email) return { error: 'That is already your current email.' };

  const taken = await prisma.user.findUnique({ where: { email: normalized } });
  if (taken) return { error: 'That email is already in use.' };

  const identifier = `email-change:${userId}`;
  const token = crypto.randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 jam
  const link = `${process.env.APP_URL}/api/verify-email-change?token=${token}`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const sent = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: normalized,
    subject: 'Confirm your new email — Kurspektif',
    html: `<p>Click the link below to confirm your new email address:</p><p><a href="${link}">${link}</a></p><p>This link expires in 1 hour.</p>`,
  });

  if (sent.error) return { error: 'Failed to send verification email. Please try again.' };

  // Hapus token lama dulu supaya cuma satu token aktif per user.
  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({ data: { identifier, token, newEmail: normalized, expires } });

  return { success: `Check ${normalized} to confirm the change.` };
}