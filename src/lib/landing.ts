// Data nyata untuk landing page: kurs pasangan utama dunia, penggerak minggu
// ini, garis 30 hari, dan berita. Semua bagian boleh gagal sendiri —
// landing tetap tampil, bagian yang datanya tidak ada disembunyikan.
import { newsForCurrencies, type NewsItem } from './marketaux';
import { watchlistSnapshot, type WatchedSnapshot } from './watchlist';
import { WORLD_PAIRS } from './pairs';

/** Contoh di landing: pasangan yang paling banyak diperdagangkan, plus rupiah. */
export const HERO_PAIRS = ['EUR/USD', 'USD/JPY', 'GBP/USD', 'USD/CNY', 'AUD/USD', 'USD/IDR'];
/** Daftar kurs di bagian bawah landing (juga pilihan Pantauan di pratinjau email). */
export const LIST_PAIRS = [...WORLD_PAIRS, 'USD/IDR'];
// Tanpa IDR: berita rupiah sudah banyak di arsip dan akan mendominasi; yang
// didahulukan di landing adalah berita pasangan mata uang utama.
const NEWS_CODES = ['USD', 'EUR', 'JPY', 'GBP', 'CNY', 'CHF', 'AUD'];
// Marketaux kadang menandai laporan perusahaan dengan mata uang; di landing
// hanya tampilkan yang judulnya memang soal kurs.
const ABOUT_FX = /\b(dollar|dolar|euro|yen|pound|sterling|yuan|franc|rupiah|currenc|forex|fx|exchange rate|kurs|[A-Z]{3}\/[A-Z]{3})/i;

export type PairSnapshot = WatchedSnapshot;

export type LandingData = {
  pairs: PairSnapshot[];
  /** Pasangan contoh yang paling banyak bergerak minggu ini — isian awal kotak "ketik pasangan". */
  featured: PairSnapshot | null;
  news: NewsItem[];
};

export async function loadLandingData(): Promise<LandingData> {
  const [pairs, news] = await Promise.all([
    // 45 hari kalender ≈ 30 kurs harian untuk garis kecil di pratinjau email.
    watchlistSnapshot([...new Set([...HERO_PAIRS, ...LIST_PAIRS])], 45).catch(() => []),
    newsForCurrencies(NEWS_CODES, 40)
      .then((items) => items.filter((item) => ABOUT_FX.test(item.headline)).slice(0, 4))
      .catch(() => []),
  ]);
  const featured =
    pairs
      .filter((p) => HERO_PAIRS.includes(p.pair) && p.movers)
      .sort((a, b) => Math.abs(b.weekPct ?? 0) - Math.abs(a.weekPct ?? 0))[0] ?? null;
  return { pairs, featured, news };
}
