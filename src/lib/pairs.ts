// Pasangan untuk halaman kurs publik (/kurs/usd-idr): pasangan utama dunia,
// plus mata uang yang paling sering ditukar orang Indonesia ke rupiah.
export const POPULAR_BASES = ['USD', 'SGD', 'EUR', 'JPY', 'MYR', 'SAR', 'AUD', 'CNY', 'GBP', 'KRW', 'HKD', 'CHF'];
export const POPULAR_PAIRS = POPULAR_BASES.map((code) => `${code}/IDR`);

/** Pasangan utama dunia, yang paling banyak diperdagangkan. */
export const WORLD_PAIRS = ['EUR/USD', 'USD/JPY', 'GBP/USD', 'USD/CHF', 'AUD/USD', 'USD/CNY', 'USD/SGD'];
/** Semua halaman kurs yang dibuat lebih dulu dan masuk sitemap. */
export const FEATURED_PAIRS = [...WORLD_PAIRS, ...POPULAR_PAIRS];

/** Kode ISO 4217: tiga huruf kapital. */
export const isCurrencyCode = (code: string) => /^[A-Z]{3}$/.test(code);

export const pairToSlug = (pair: string) => pair.replace('/', '-').toLowerCase();

/** "usd-idr" → ["USD", "IDR"]; null kalau formatnya salah. */
export function slugToPair(slug: string): [string, string] | null {
  const match = /^([a-z]{3})-([a-z]{3})$/.exec(slug);
  if (!match || match[1] === match[2]) return null;
  return [match[1].toUpperCase(), match[2].toUpperCase()];
}

/** Berapa banyak `codes` yang muncul di pasangan berita — untuk mengurutkan relevansi. */
export const pairMatchCount = (pair: string | null | undefined, codes: string[]) =>
  codes.filter((code) => pair?.split('/').includes(code)).length;

/** Yang memuat lebih banyak `codes` di depan; urutan asli (terbaru dulu) dipertahankan. */
export function byRelevance<T>(items: T[], pairOf: (item: T) => string | null | undefined, codes: string[]): T[] {
  return items
    .map((item, index) => ({ item, index, score: pairMatchCount(pairOf(item), codes) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ item }) => item);
}
