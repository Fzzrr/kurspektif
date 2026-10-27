'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { verifyUnsubscribeToken } from '@/lib/unsubscribe';

export async function unsubscribeAction(formData: FormData) {
  const userId = String(formData.get('u') ?? '');
  const token = String(formData.get('t') ?? '');
  if (!verifyUnsubscribeToken(userId, token)) redirect('/berhenti-langganan?status=invalid');
  await prisma.user.updateMany({ where: { id: userId }, data: { weeklyDigest: false } });
  redirect('/berhenti-langganan?status=done');
}
