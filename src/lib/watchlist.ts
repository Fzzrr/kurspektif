import { prisma } from './prisma';
import { fetchUsdRates, toISODate } from './frankfurter';
import { fetchWeeklyMoversMany, type WeeklyMovers } from './movers';
import { explain } from './moversText';

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
};

/** Kurs terbaru dan perubahan minggu ini untuk pasangan apa pun — dua request total. */
export async function watchlistSnapshot(pairs: string[]): Promise<WatchedSnapshot[]> {
  if (pairs.length === 0) return [];
  const codes = [...new Set(pairs.flatMap((pair) => pair.split('/')))].filter((code) => code !== 'USD');
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 10); // cadangan akhir pekan & libur
  const [byDate, movers] = await Promise.all([
    fetchUsdRates(codes, toISODate(from), toISODate(to)),
    fetchWeeklyMoversMany(pairs),
  ]);
  const days = [...byDate.keys()].sort().map((date) => ({ date, rates: { USD: 1, ...byDate.get(date) } as Record<string, number> }));

  return pairs.map((pair) => {
    const [base, quote] = pair.split('/');
    const day = days.findLast((d) => d.rates[base] && d.rates[quote]);
    const week = movers.get(pair) ?? null;
    return {
      pair,
      rate: day ? day.rates[quote] / day.rates[base] : null,
      date: day?.date ?? null,
      weekPct: week?.pairChangePct ?? null,
      reason: week ? explain(week) : null,
      movers: week,
    };
  });
}
