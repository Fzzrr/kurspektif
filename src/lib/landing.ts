// Data nyata untuk landing page: kurs hari ini, penggerak minggu ini, posisi
// historis USD/IDR, agenda, dan berita rupiah. Semua bagian boleh gagal sendiri
// — landing tetap tampil, bagian yang datanya tidak ada disembunyikan.
import { fetchRateSeries, fetchUsdRates, toISODate, type RatePoint } from './frankfurter';
import { fetchWeeklyMoversMany, type WeeklyMovers } from './movers';
import { explain } from './moversText';
import { eventsFor, type EconomicEvent } from './calendar';
import { newsForCurrencies, type NewsItem } from './marketaux';
import { percentileOf } from './alerts';
import { todayKey } from './timeAgo';

/** Pilihan di hero (pasangan ke rupiah yang paling sering dicari). */
export const HERO_CODES = ['USD', 'SGD', 'SAR', 'MYR', 'JPY'];
/** Daftar kurs di bagian bawah landing. */
export const LIST_CODES = ['USD', 'SGD', 'EUR', 'JPY', 'SAR', 'MYR', 'AUD'];

export type PairSnapshot = {
  code: string;
  rate: number;
  date: string;
  weekPct: number | null;
  reason: string | null;
};

export type Position = {
  percentile: number;
  lower: number;
  total: number;
  min: RatePoint;
  max: RatePoint;
  average: number;
  /** Per bulan: berapa hari kursnya lebih rendah dari hari ini. */
  months: { label: string; lower: number; days: number }[];
};

export type LandingData = {
  pairs: PairSnapshot[];
  usdIdr: WeeklyMovers | null;
  position: Position | null;
  agenda: EconomicEvent[];
  news: NewsItem[];
};

const monthFormatter = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric', timeZone: 'UTC' });

/** Kurs X→IDR terbaru plus perubahan & penyebab minggu ini, untuk `codes`. */
export async function loadPairs(
  codes: string[] = [...new Set([...HERO_CODES, ...LIST_CODES])],
): Promise<{ pairs: PairSnapshot[]; usdIdr: WeeklyMovers | null }> {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 10);
  const [byDate, movers] = await Promise.all([
    fetchUsdRates(['IDR', ...codes.filter((c) => c !== 'USD')], toISODate(from), toISODate(to)),
    fetchWeeklyMoversMany(codes.map((code) => `${code}/IDR`)),
  ]);
  const days = [...byDate.keys()].sort().map((date) => ({ date, rates: { USD: 1, ...byDate.get(date) } as Record<string, number> }));

  const pairs = codes.flatMap((code) => {
    const day = days.findLast((d) => d.rates[code] && d.rates.IDR);
    if (!day) return [];
    const week = movers.get(`${code}/IDR`) ?? null;
    return [
      {
        code,
        rate: day.rates.IDR / day.rates[code],
        date: day.date,
        weekPct: week?.pairChangePct ?? null,
        reason: week ? explain(week) : null,
      },
    ];
  });
  return { pairs, usdIdr: movers.get('USD/IDR') ?? null };
}

async function loadPosition(): Promise<Position | null> {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 140); // cukup untuk 90 hari kerja
  const series = (await fetchRateSeries('USD', 'IDR', toISODate(from), toISODate(to))).slice(-90);
  if (series.length < 10) return null;
  const today = series[series.length - 1];
  const history = series.map((p) => p.rate);

  const months = new Map<string, { label: string; lower: number; days: number }>();
  for (const point of series) {
    const key = point.date.slice(0, 7);
    const month = months.get(key) ?? { label: monthFormatter.format(new Date(`${key}-01`)), lower: 0, days: 0 };
    month.days++;
    if (point.rate < today.rate) month.lower++;
    months.set(key, month);
  }

  return {
    percentile: percentileOf(today.rate, history),
    lower: history.filter((rate) => rate < today.rate).length,
    total: history.length,
    min: series.reduce((a, b) => (b.rate < a.rate ? b : a)),
    max: series.reduce((a, b) => (b.rate > a.rate ? b : a)),
    average: history.reduce((sum, rate) => sum + rate, 0) / history.length,
    months: [...months.values()],
  };
}

export async function loadLandingData(): Promise<LandingData> {
  const today = todayKey();
  const [pairs, position, news] = await Promise.all([
    loadPairs().catch(() => ({ pairs: [], usdIdr: null })),
    loadPosition().catch(() => null),
    newsForCurrencies(['IDR'], 4).catch(() => []),
  ]);
  return {
    ...pairs,
    position,
    agenda: [...eventsFor(['IDR', 'USD'], today, -14), ...eventsFor(['IDR', 'USD'], today, 45)]
      .filter((event, i, all) => all.indexOf(event) === i)
      .slice(0, 5),
    news,
  };
}
