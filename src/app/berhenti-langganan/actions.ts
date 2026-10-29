'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { SUBSCRIPTIONS, parseSubscription, verifyUnsubscribeToken } from '@/lib/unsubscribe';

export async function unsubscribeAction(formData: FormData) {
  const userId = String(formData.get('u') ?? '');
  const token = String(formData.get('t') ?? '');
  const kind = parseSubscription(String(formData.get('k') ?? ''));
  const back = kind === 'ringkasan' ? '' : `&k=${kind}`;
  if (!verifyUnsubscribeToken(userId, token, undefined, kind)) redirect(`/berhenti-langganan?status=invalid${back}`);
  await prisma.user.updateMany({ where: { id: userId }, data: { [SUBSCRIPTIONS[kind].field]: false } });
  redirect(`/berhenti-langganan?status=done${back}`);
}
