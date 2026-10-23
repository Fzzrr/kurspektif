import { NextResponse } from 'next/server';
import { fetchWeeklyMovers } from '@/lib/movers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const base = (searchParams.get('base') ?? '').toUpperCase();
  const quote = (searchParams.get('quote') ?? '').toUpperCase();

  if (!/^[A-Z]{3}$/.test(base) || !/^[A-Z]{3}$/.test(quote) || base === quote) {
    return NextResponse.json({ error: 'Invalid currency pair' }, { status: 400 });
  }

  try {
    // `null` = data kurs belum cukup untuk dianalisis.
    return NextResponse.json(await fetchWeeklyMovers(base, quote));
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 502 });
  }
}
