import { NextResponse } from 'next/server';
import { MAX_SERIES_DAYS, fetchLatestRate, fetchRateSeries, toISODate } from '@/lib/frankfurter';
import { isCurrencyCode } from '@/lib/pairs';
import { clientIp, publicApiLimiter } from '@/lib/rateLimit';

// Publik (dipakai komponen client), jadi dibatasi per IP dan rentangnya dikunci:
// tanpa itu satu permintaan `days=20000` menahan server ~25 detik.
export async function GET(request: Request) {
  if (!(await publicApiLimiter.check(`api:${clientIp(request.headers)}`)).success) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan. Coba lagi sebentar lagi.' }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const base = (searchParams.get('base') ?? 'USD').toUpperCase();
  const quote = (searchParams.get('quote') ?? 'IDR').toUpperCase();
  const days = Number(searchParams.get('days') ?? 365);

  if (!isCurrencyCode(base) || !isCurrencyCode(quote)) {
    return NextResponse.json({ error: 'Kode mata uang tidak valid.' }, { status: 400 });
  }
  if (!Number.isInteger(days) || days < 1 || days > MAX_SERIES_DAYS) {
    return NextResponse.json({ error: `days harus bilangan bulat 1–${MAX_SERIES_DAYS}.` }, { status: 400 });
  }

  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - days);

  try {
    const [latest, series] = await Promise.all([
      fetchLatestRate(base, quote),
      fetchRateSeries(base, quote, toISODate(from), toISODate(to)),
    ]);
    return NextResponse.json({ latest, series }, { headers: { 'Cache-Control': 'public, max-age=300' } });
  } catch (err) {
    // Detail kegagalan hanya ke log server, bukan ke pengunjung.
    console.error('api/rates gagal:', err);
    return NextResponse.json({ error: 'Kurs sedang tidak bisa dimuat.' }, { status: 502 });
  }
}
