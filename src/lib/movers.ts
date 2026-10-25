// Apa yang menggerakkan sebuah pasangan minggu ini, dihitung dari kurs saja
// (bukan berita): tiap mata uang dibandingkan dengan sekeranjang mata uang
// utama, jadi kelihatan sisi mana yang sebenarnya bergerak.
import { fetchUsdRates, toISODate } from './frankfurter';

const BASKET = ['USD', 'EUR', 'JPY', 'GBP', 'CNY', 'SGD'];
// Ikut diperingkat sebagai pembanding, tapi bukan bagian keranjang pengukur.
const EXTRA_RANKED = ['AUD', 'CHF'];
const WEEK_DAYS = 7;

type Strength = { code: string; strengthPct: number };

export type WeeklyMovers = {
  /** Perubahan pasangan (quote per base) selama seminggu, dalam persen. */
  pairChangePct: number;
  /** Positif = mata uang itu menguat terhadap keranjang. */
  sides: Strength[];
  /** Mata uang utama + kedua sisi pasangan, dari terkuat ke terlemah. */
  ranking: Strength[];
  /** Perubahan harian terbesar (absolut) di dalam jendela minggu ini. */
  volatileDay: { date: string; changePct: number } | null;
};

const codesFor = (base: string, quote: string) => [...new Set([...BASKET, ...EXTRA_RANKED, base, quote])];

type DayRates = Record<string, number>;

// Frankfurter tidak mengembalikan USD terhadap dirinya sendiri.
const rateOf = (day: DayRates, code: string) => (code === 'USD' ? 1 : day[code]);

export function analyzeWeek(byDate: Map<string, DayRates>, base: string, quote: string): WeeklyMovers | null {
  const needed = codesFor(base, quote).filter((code) => code !== 'USD');
  // Hanya tanggal yang punya kurs untuk semua mata uang — mata uang di luar ECB
  // kadang diperbarui di hari berbeda.
  const dates = [...byDate.keys()]
    .filter((date) => needed.every((code) => byDate.get(date)![code] !== undefined))
    .sort();
  if (dates.length < 2) return null;

  const end = dates[dates.length - 1];
  const cutoff = new Date(end);
  cutoff.setDate(cutoff.getDate() - WEEK_DAYS);
  const startIndex = dates.findLastIndex((date) => date <= toISODate(cutoff));
  if (startIndex === -1) return null;

  const window = dates.slice(startIndex);
  const start = window[0];
  const at = (date: string) => byDate.get(date)!;
  const pair = (date: string) => rateOf(at(date), quote) / rateOf(at(date), base);

  // Rata-rata perubahan berapa banyak mata uang keranjang yang bisa dibeli
  // dengan 1 unit `code`.
  const strength = (code: string) => {
    const changes = BASKET.filter((other) => other !== code).map((other) => {
      const before = rateOf(at(start), other) / rateOf(at(start), code);
      const after = rateOf(at(end), other) / rateOf(at(end), code);
      return after / before - 1;
    });
    return (changes.reduce((sum, change) => sum + change, 0) / changes.length) * 100;
  };

  let volatileDay: WeeklyMovers['volatileDay'] = null;
  for (let i = 1; i < window.length; i++) {
    const changePct = (pair(window[i]) / pair(window[i - 1]) - 1) * 100;
    if (!volatileDay || Math.abs(changePct) > Math.abs(volatileDay.changePct)) {
      volatileDay = { date: window[i], changePct };
    }
  }

  return {
    pairChangePct: (pair(end) / pair(start) - 1) * 100,
    sides: [base, quote].map((code) => ({ code, strengthPct: strength(code) })),
    ranking: codesFor(base, quote)
      .map((code) => ({ code, strengthPct: strength(code) }))
      .sort((a, b) => b.strengthPct - a.strengthPct),
    volatileDay,
  };
}

function weekRange() {
  const to = new Date();
  const from = new Date(to);
  // 14 hari, bukan 7 — cadangan untuk akhir pekan dan hari libur bursa.
  from.setDate(from.getDate() - 14);
  return [toISODate(from), toISODate(to)] as const;
}

export async function fetchWeeklyMovers(base: string, quote: string): Promise<WeeklyMovers | null> {
  const quotes = codesFor(base, quote).filter((code) => code !== 'USD');
  return analyzeWeek(await fetchUsdRates(quotes, ...weekRange()), base, quote);
}

/** Banyak pasangan sekaligus dengan satu request — untuk email ringkasan. */
export async function fetchWeeklyMoversMany(pairs: string[]): Promise<Map<string, WeeklyMovers | null>> {
  const split = pairs.map((pair) => pair.split('/') as [string, string]);
  const quotes = [...new Set(split.flatMap(([base, quote]) => codesFor(base, quote)))].filter((code) => code !== 'USD');
  const byDate = await fetchUsdRates(quotes, ...weekRange());
  return new Map(split.map(([base, quote]) => [`${base}/${quote}`, analyzeWeek(byDate, base, quote)]));
}
