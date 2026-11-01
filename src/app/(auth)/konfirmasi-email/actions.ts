'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { hashToken } from '@/lib/tokens';

const IDENTIFIER_PREFIX = 'email-change:';

// Dipanggil tombol "Konfirmasi" (POST), bukan saat tautan dibuka: pemindai
// tautan di layanan email sering membuka GET otomatis dan tidak boleh ikut
// mengganti email akun.
export async function confirmEmailChangeAction(formData: FormData) {
  const token = String(formData.get('token') ?? '');
  const record = token ? await prisma.verificationToken.findUnique({ where: { token: hashToken(token) } }) : null;
  if (!record?.newEmail || !record.identifier.startsWith(IDENTIFIER_PREFIX)) redirect('/konfirmasi-email?status=invalid');

  if (record.expires < new Date()) {
    await prisma.verificationToken.deleteMany({ where: { identifier: record.identifier } });
    redirect('/konfirmasi-email?status=expired');
  }

  const userId = record.identifier.slice(IDENTIFIER_PREFIX.length);
  const taken = await prisma.user.findUnique({ where: { email: record.newEmail }, select: { id: true } });
  await prisma.verificationToken.deleteMany({ where: { identifier: record.identifier } });
  if (taken && taken.id !== userId) redirect('/konfirmasi-email?status=taken');

  await prisma.user.update({ where: { id: userId }, data: { email: record.newEmail, emailVerified: new Date() } });
  redirect('/konfirmasi-email?status=done');
}
