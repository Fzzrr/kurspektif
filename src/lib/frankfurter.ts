const FRANKFURTER_BASE = 'https://api.frankfurter.dev/v2';

export type RatePoint = { date: string; rate: number };
export type Currency = { code: string; name: string };

async function fetchRateRaw(base: string, quote: string): Promise<RatePoint> {
  const res = await fetch(`${FRANKFURTER_BASE}/rate/${base}/${quote}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`Failed to fetch latest rate (${res.status})`);
  const data = await res.json();
  return { date: data.date, rate: data.rate };
}

async function fetchRateSeriesRaw(base: string, quote: string, from: string, to: string): Promise<RatePoint[]> {
  const params = new URLSearchParams({ base, quotes: quote, from, to });
  const res = await fetch(`${FRANKFURTER_BASE}/rates?${params}`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Failed to fetch rate series (${res.status})`);
  const data: { date: string; rate: number }[] = await res.json();
  return data.map((d) => ({ date: d.date, rate: d.rate }));
}

// Frankfurter cuma memberi ~2 angka penting untuk nilai di bawah 1 (mis.
// IDR->USD selalu "5.6e-05" berhari-hari lalu tiba-tiba "5.5e-05" — bukan
// fluktuasi asli, cuma pembulatan sumbernya). Kalau nilai langsungnya < 1,
// ambil arah SEBALIKNYA (yang nilainya > 1, presisi jauh lebih baik) lalu
// balik sendiri (1 / rate) — hasilnya jauh lebih presisi.
export async function fetchLatestRate(base: string, quote: string): Promise<RatePoint> {
  const direct = await fetchRateRaw(base, quote);
  if (direct.rate >= 1) return direct;
  const inverse = await fetchRateRaw(quote, base);
  return { date: inverse.date, rate: 1 / inverse.rate };
}

export async function fetchRateSeries(base: string, quote: string, from: string, to: string): Promise<RatePoint[]> {
  const direct = await fetchRateSeriesRaw(base, quote, from, to);
  const looksImprecise = direct.length > 0 && direct[direct.length - 1].rate < 1;
  if (!looksImprecise) return direct;
  const inverse = await fetchRateSeriesRaw(quote, base, from, to);
  return inverse.map((point) => ({ date: point.date, rate: 1 / point.rate }));
}

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function fetchSupportedCurrencies(): Promise<Currency[]> {
  const res = await fetch(`${FRANKFURTER_BASE}/currencies`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`Failed to fetch currency list (${res.status})`);
  const data: { iso_code: string; name: string; end_date: string }[] = await res.json();

  const mostRecent = data.reduce((max, c) => (c.end_date > max ? c.end_date : max), '');
  return data
    .filter((c) => c.end_date === mostRecent)
    .map((c) => ({ code: c.iso_code, name: c.name }))
    .sort((a, b) => a.code.localeCompare(b.code));
}