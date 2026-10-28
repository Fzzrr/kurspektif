// Data nyata untuk landing page: kurs pasangan utama dunia, penggerak minggu
// ini, posisi historis, dan berita. Semua bagian boleh gagal sendiri —
// landing tetap tampil, bagian yang datanya tidak ada disembunyikan.
import { fetchRateSeries, toISODate, type RatePoint } from './frankfurter';
import { newsForCurrencies, type NewsItem } from './marketaux';
import { percentileOf } from './alerts';
import { watchlistSnapshot, type WatchedSnapshot } from './watchlist';
import { WORLD_PAIRS } from './pairs';

/** Pilihan di hero: pasangan yang paling banyak diperdagangkan, plus rupiah. */
export const HERO_PAIRS = ['EUR/USD', 'USD/JPY', 'GBP/USD', 'USD/CNY', 'AUD/USD', 'USD/IDR'];
/** Daftar kurs di bagian bawah landing. */
export const LIST_PAIRS = [...WORLD_PAIRS, 'USD/IDR'];
// Tanpa IDR: berita rupiah sudah banyak di arsip dan akan mendominasi; yang
// didahulukan di landing adalah berita pasangan mata uang utama.
const NEWS_CODES = ['USD', 'EUR', 'JPY', 'GBP', 'CNY', 'CHF', 'AUD'];
// Marketaux kadang menandai laporan perusahaan dengan mata uang; di landing
// hanya tampilkan yang judulnya memang soal kurs.
const ABOUT_FX = /\b(dollar|dolar|euro|yen|pound|sterling|yuan|franc|rupiah|currenc|forex|fx|exchange rate|kurs|[A-Z]{3}\/[A-Z]{3})/i;

export type PairSnapshot = WatchedSnapshot;

export type Position = {
  pair: string;
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
  /** Pasangan hero yang paling banyak bergerak minggu ini — jadi contoh di landing. */
  featured: PairSnapshot | null;
  position: Position | null;
  news: NewsItem[];
};

const monthFormatter = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric', timeZone: 'UTC' });

async function loadPosition(pair: string): Promise<Position | null> {
  const [base, quote] = pair.split('/');
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 140); // cukup untuk 90 hari kerja
  const series = (await fetchRateSeries(base, quote, toISODate(from), toISODate(to))).slice(-90);
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
    pair,
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
  const [pairs, news] = await Promise.all([
    watchlistSnapshot([...new Set([...HERO_PAIRS, ...LIST_PAIRS])]).catch(() => []),
    newsForCurrencies(NEWS_CODES, 40)
      .then((items) => items.filter((item) => ABOUT_FX.test(item.headline)).slice(0, 4))
      .catch(() => []),
  ]);
  const featured =
    pairs
      .filter((p) => HERO_PAIRS.includes(p.pair) && p.movers)
      .sort((a, b) => Math.abs(b.weekPct ?? 0) - Math.abs(a.weekPct ?? 0))[0] ?? null;
  const position = featured ? await loadPosition(featured.pair).catch(() => null) : null;

  return {
    pairs,
    featured,
    position,
    news,
  };
}
