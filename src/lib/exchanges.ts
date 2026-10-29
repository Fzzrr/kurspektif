// Catatan penukaran: kurs yang benar-benar didapat pengguna di bank/money
// changer, dibandingkan dengan kurs tengah referensi di hari yang sama.
// Aman dipakai di client maupun server (tanpa Prisma).
import { fmtPct } from './moversText';

export type ExchangeSide = 'beli' | 'jual';
export const SIDES: readonly ExchangeSide[] = ['beli', 'jual'];
export const MAX_RECORDS = 200;

export type ExchangeDTO = {
  id: string;
  side: ExchangeSide;
  base: string;
  quote: string;
  amount: number;
  rate: number;
  date: string;
  midRate: number;
  midDate: string;
  place: string | null;
};

export type ExchangeInput = {
  side: ExchangeSide;
  base: string;
  quote: string;
  amount: string;
  rate: string;
  date: string;
  place: string;
};

/**
 * Selisih terhadap kurs tengah, dalam mata uang `quote`. Positif = kamu membayar
 * lebih (saat membeli) atau menerima kurang (saat menjual) dari kurs tengah,
 * yaitu biaya yang diambil bank/money changer. Negatif = lebih baik dari kurs tengah.
 */
export function exchangeCost({ side, amount, rate, midRate }: Pick<ExchangeDTO, 'side' | 'amount' | 'rate' | 'midRate'>) {
  const perUnit = side === 'beli' ? rate - midRate : midRate - rate;
  return { total: perUnit * amount, pct: (perUnit / midRate) * 100 };
}

export type QuoteSummary = { quote: string; count: number; cost: number; volume: number; pct: number };
export type PairSummary = { pair: string; base: string; quote: string; bought: number; avgBuy: number | null; sold: number; avgSell: number | null };
export type PlaceSummary = { place: string; count: number; cost: number; volume: number; pct: number };

/**
 * Total selisih per mata uang pembayaran, kurs rata-rata (tertimbang jumlah)
 * per pasangan, dan biaya rata-rata per tempat. `records` diharapkan urut
 * terbaru dulu: ejaan tempat yang tampil adalah yang terakhir dipakai.
 */
export type Saving = { place: string; pct: number; amount: number; quote: string };

export function summarize(records: ExchangeDTO[]): {
  byQuote: QuoteSummary[];
  byPair: PairSummary[];
  byPlace: PlaceSummary[];
  /** Hemat kalau semua penukaran (mata uang utama) berbiaya seperti tempat termurah. */
  saving: Saving | null;
} {
  const quotes = new Map<string, QuoteSummary>();
  const pairs = new Map<string, PairSummary & { buyValue: number; sellValue: number }>();

  for (const record of records) {
    const q = quotes.get(record.quote) ?? { quote: record.quote, count: 0, cost: 0, volume: 0, pct: 0 };
    q.count++;
    q.cost += exchangeCost(record).total;
    q.volume += record.midRate * record.amount;
    quotes.set(record.quote, q);

    const key = `${record.base}/${record.quote}`;
    const p = pairs.get(key) ?? { pair: key, base: record.base, quote: record.quote, bought: 0, avgBuy: null, sold: 0, avgSell: null, buyValue: 0, sellValue: 0 };
    if (record.side === 'beli') {
      p.bought += record.amount;
      p.buyValue += record.amount * record.rate;
    } else {
      p.sold += record.amount;
      p.sellValue += record.amount * record.rate;
    }
    pairs.set(key, p);
  }

  const byQuote = [...quotes.values()]
    .map((q) => ({ ...q, pct: q.volume > 0 ? (q.cost / q.volume) * 100 : 0 }))
    .sort((a, b) => b.volume - a.volume);

  // ponytail: perbandingan tempat hanya untuk mata uang pembayaran utama
  // (biasanya IDR) — biaya dalam IDR dan USD tidak bisa dijumlah begitu saja.
  const mainQuote = byQuote[0]?.quote;
  const places = new Map<string, PlaceSummary>();
  for (const record of records) {
    if (!record.place || record.quote !== mainQuote) continue;
    const key = record.place.trim().toLowerCase();
    const place = places.get(key) ?? { place: record.place.trim(), count: 0, cost: 0, volume: 0, pct: 0 };
    place.count++;
    place.cost += exchangeCost(record).total;
    place.volume += record.midRate * record.amount;
    places.set(key, place);
  }

  const byPlace = [...places.values()]
    .map((place) => ({ ...place, pct: place.volume > 0 ? (place.cost / place.volume) * 100 : 0 }))
    .sort((a, b) => a.pct - b.pct);

  const main = byQuote[0];
  const cheapest = byPlace[0];
  const savingAmount = main && cheapest && byPlace.length >= 2 ? main.cost - (main.volume * cheapest.pct) / 100 : 0;

  return {
    byQuote,
    byPair: [...pairs.values()].map(({ buyValue, sellValue, ...p }) => ({
      ...p,
      avgBuy: p.bought > 0 ? buyValue / p.bought : null,
      avgSell: p.sold > 0 ? sellValue / p.sold : null,
    })),
    byPlace,
    saving: savingAmount > 0 ? { place: cheapest.place, pct: cheapest.pct, amount: savingAmount, quote: main.quote } : null,
  };
}

export type MonthCost = { month: string; cost: number; volume: number; count: number };

/**
 * Biaya per bulan ("YYYY-MM") untuk satu mata uang pembayaran, dari bulan
 * catatan pertama sampai `untilMonth`. Bulan tanpa penukaran tetap ada dengan
 * nilai 0 supaya grafiknya jujur soal jeda; paling banyak `limit` bulan terakhir.
 */
export function costByMonth(records: ExchangeDTO[], quote: string, untilMonth: string, limit = 12): MonthCost[] {
  const relevant = records.filter((record) => record.quote === quote);
  if (relevant.length === 0) return [];
  const byMonth = new Map<string, MonthCost>();
  for (const record of relevant) {
    const month = record.date.slice(0, 7);
    const entry = byMonth.get(month) ?? { month, cost: 0, volume: 0, count: 0 };
    entry.cost += exchangeCost(record).total;
    entry.volume += record.midRate * record.amount;
    entry.count++;
    byMonth.set(month, entry);
  }

  const first = relevant.reduce((min, record) => (record.date < min ? record.date : min), relevant[0].date).slice(0, 7);
  const months: MonthCost[] = [];
  let [year, month] = first.split('-').map(Number);
  for (let key = first; key <= untilMonth; ) {
    months.push(byMonth.get(key) ?? { month: key, cost: 0, volume: 0, count: 0 });
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
    key = `${year}-${String(month).padStart(2, '0')}`;
  }
  return months.slice(-limit);
}

/**
 * Selisih persen dalam kata. Positif = biaya; negatif = kursnya lebih baik dari
 * kurs tengah (untuk beli maupun jual), jadi tandanya tidak pernah dibuang diam-diam.
 * Pendek untuk daftar ("biaya 1,05%", "untung 0,88%"), panjang untuk kalimat.
 */
export function costText(pct: number, long = false) {
  const value = fmtPct(Math.abs(pct)).replace('+', '');
  if (value === '0%') return 'setara kurs tengah';
  if (pct > 0) return long ? `biaya ${value} dari kurs tengah` : `biaya ${value}`;
  return long ? `${value} lebih baik dari kurs tengah` : `untung ${value}`;
}

const amountFormatter = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 });
const wholeFormatter = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });
/** Nominal uang: tanpa desimal untuk angka besar (Rp 412.350), dua desimal untuk yang kecil (USD 12,5). */
export const formatAmount = (value: number) => (Math.abs(value) >= 100 ? wholeFormatter : amountFormatter).format(value);

export function toExchangeDTO(row: {
  id: string;
  side: string;
  base: string;
  quote: string;
  amount: number;
  rate: number;
  date: string;
  midRate: number;
  midDate: string;
  place: string | null;
}): ExchangeDTO {
  return { ...row, side: row.side === 'jual' ? 'jual' : 'beli' };
}
