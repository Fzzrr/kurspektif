// Berhenti berlangganan sekali klik (RFC 8058): layanan email seperti Gmail
// mengirim POST ke sini dari tombol "Unsubscribe" bawaannya. GET diarahkan ke
// halaman konfirmasi — pemindai tautan sering membuka GET otomatis, jadi GET
// tidak boleh langsung mematikan langganan.
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SUBSCRIPTIONS, parseSubscription, verifyUnsubscribeToken } from '@/lib/unsubscribe';

function params(request: Request) {
  const url = new URL(request.url);
  return {
    userId: url.searchParams.get('u') ?? '',
    token: url.searchParams.get('t') ?? '',
    kind: parseSubscription(url.searchParams.get('k')),
  };
}

export async function POST(request: Request) {
  const { userId, token, kind } = params(request);
  if (!verifyUnsubscribeToken(userId, token, undefined, kind)) return new NextResponse('Tautan tidak valid.', { status: 400 });
  await prisma.user.updateMany({ where: { id: userId }, data: { [SUBSCRIPTIONS[kind].field]: false } });
  return new NextResponse(`Kamu tidak akan menerima ${SUBSCRIPTIONS[kind].name} lagi.`);
}

export function GET(request: Request) {
  const { userId, token, kind } = params(request);
  const target = new URL('/berhenti-langganan', request.url);
  target.searchParams.set('u', userId);
  target.searchParams.set('t', token);
  if (kind !== 'ringkasan') target.searchParams.set('k', kind);
  return NextResponse.redirect(target);
}
