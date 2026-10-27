// Berhenti berlangganan sekali klik (RFC 8058): layanan email seperti Gmail
// mengirim POST ke sini dari tombol "Unsubscribe" bawaannya. GET diarahkan ke
// halaman konfirmasi — pemindai tautan sering membuka GET otomatis, jadi GET
// tidak boleh langsung mematikan langganan.
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUnsubscribeToken } from '@/lib/unsubscribe';

function params(request: Request) {
  const url = new URL(request.url);
  return { userId: url.searchParams.get('u') ?? '', token: url.searchParams.get('t') ?? '' };
}

export async function POST(request: Request) {
  const { userId, token } = params(request);
  if (!verifyUnsubscribeToken(userId, token)) return new NextResponse('Tautan tidak valid.', { status: 400 });
  await prisma.user.updateMany({ where: { id: userId }, data: { weeklyDigest: false } });
  return new NextResponse('Kamu tidak akan menerima ringkasan mingguan lagi.');
}

export function GET(request: Request) {
  const { userId, token } = params(request);
  const target = new URL('/berhenti-langganan', request.url);
  target.searchParams.set('u', userId);
  target.searchParams.set('t', token);
  return NextResponse.redirect(target);
}
