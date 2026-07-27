import { NextResponse } from 'next/server';
import { fetchLatestRate, fetchRateSeries, toISODate } from '@/lib/frankfurter';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const base = (searchParams.get('base') ?? 'USD').toUpperCase();
  const quote = (searchParams.get('quote') ?? 'IDR').toUpperCase();
  const days = Number(searchParams.get('days') ?? 365);

  if (!/^[A-Z]{3}$/.test(base) || !/^[A-Z]{3}$/.test(quote)) {
    return NextResponse.json({ error: 'Invalid currency code' }, { status: 400 });
  }

  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - days);

  try {
    const [latest, series] = await Promise.all([
      fetchLatestRate(base, quote),
      fetchRateSeries(base, quote, toISODate(from), toISODate(to)),
    ]);
    return NextResponse.json({ latest, series });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 502 });
  }
}