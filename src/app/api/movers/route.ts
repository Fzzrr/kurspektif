import { NextResponse } from 'next/server';
import { fetchWeeklyMovers } from '@/lib/movers';
import { isCurrencyCode } from '@/lib/pairs';
import { clientIp, publicApiLimiter } from '@/lib/rateLimit';

export async function GET(request: Request) {
  if (!(await publicApiLimiter.check(`api:${clientIp(request.headers)}`)).success) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan. Coba lagi sebentar lagi.' }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const base = (searchParams.get('base') ?? '').toUpperCase();
  const quote = (searchParams.get('quote') ?? '').toUpperCase();

  if (!isCurrencyCode(base) || !isCurrencyCode(quote) || base === quote) {
    return NextResponse.json({ error: 'Pasangan mata uang tidak valid.' }, { status: 400 });
  }

  try {
    // `null` = data kurs belum cukup untuk dianalisis.
    return NextResponse.json(await fetchWeeklyMovers(base, quote), { headers: { 'Cache-Control': 'public, max-age=300' } });
  } catch (err) {
    console.error('api/movers gagal:', err);
    return NextResponse.json({ error: 'Penggerak kurs sedang tidak bisa dimuat.' }, { status: 502 });
  }
}
