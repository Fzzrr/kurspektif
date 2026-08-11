import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token');
  const redirectTo = (status: string) =>
    NextResponse.redirect(new URL(`/dashboard?emailChange=${status}`, request.url));

  if (!token) return redirectTo('invalid');

  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record || !record.newEmail) return redirectTo('invalid');

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    return redirectTo('expired');
  }

  const userId = record.identifier.replace('email-change:', '');

  const taken = await prisma.user.findUnique({ where: { email: record.newEmail } });
  if (taken && taken.id !== userId) {
    await prisma.verificationToken.deleteMany({ where: { identifier: record.identifier } });
    return redirectTo('taken');
  }

  await prisma.user.update({
    where: { id: userId },
    data: { email: record.newEmail, emailVerified: new Date() },
  });
  await prisma.verificationToken.deleteMany({ where: { identifier: record.identifier } });

  return redirectTo('success');
}