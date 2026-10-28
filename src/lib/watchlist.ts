import { prisma } from './prisma';
import { fetchUsdRates, toISODate, type RatePoint } from './frankfurter';
import { fetchWeeklyMoversMany, type WeeklyMovers } from './movers';
import { explain } from './moversText';

/** Batas pasangan tersimpan per pengguna. */
export const MAX_PAIRS = 8;

// Bukan di file 'use server' — fungsi yang diekspor dari sana jadi endpoint
// publik, dan siapa pun bisa memanggilnya dengan userId orang lain.
export async function watchedPairs(userId: string): Promise<string[]> {
  const rows = await prisma.watchedPair.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } });
  return rows.map((row) => `${row.base}/${row.quote}`);
}

export type WatchedSnapshot = {
  pair: string;
  rate: number | null;
  date: string | null;
  weekPct: number | null;
  reason: string | null;
  movers: WeeklyMovers | null;
  /** Kurs harian dalam jendela `historyDays`, urut lama → baru. */
  series: RatePoint[];
};

/**
 * Kurs terbaru dan perubahan minggu ini untuk pasangan apa pun — dua request total.
 * `historyDays` (hari kalender) menentukan panjang `series`; minimal 10 sebagai
 * cadangan akhir pekan & libur.
 */
export async function watchlistSnapshot(pairs: string[], historyDays = 10): Promise<WatchedSnapshot[]> {
  if (pairs.length === 0) return [];
  const codes = [...new Set(pairs.flatMap((pair) => pair.split('/')))].filter((code) => code !== 'USD');
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - Math.max(10, historyDays));
  const [byDate, movers] = await Promise.all([
    fetchUsdRates(codes, toISODate(from), toISODate(to)),
    fetchWeeklyMoversMany(pairs),
  ]);
  const days = [...byDate.keys()].sort().map((date) => ({ date, rates: { USD: 1, ...byDate.get(date) } as Record<string, number> }));

  return pairs.map((pair) => {
    const [base, quote] = pair.split('/');
    // Kurs silang lewat USD: tiap mata uang terhadap USD punya 5 angka penting,
    // cukup presisi untuk pasangan apa pun.
    const series = days
      .filter((d) => d.rates[base] && d.rates[quote])
      .map((d) => ({ date: d.date, rate: d.rates[quote] / d.rates[base] }));
    const latest = series.at(-1);
    const week = movers.get(pair) ?? null;
    return {
      pair,
      rate: latest?.rate ?? null,
      date: latest?.date ?? null,
      weekPct: week?.pairChangePct ?? null,
      reason: week ? explain(week) : null,
      movers: week,
      series,
    };
  });
}
