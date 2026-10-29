import { currencyToFlag } from './flags';
import type { Currency } from './frankfurter';

// Nama mata uang dalam bahasa Indonesia untuk kalimat di halaman publik
// ("euro menguat 0,3%"). Kode yang tidak ada di sini ditampilkan apa adanya.
const NAMES: Record<string, string> = {
  USD: 'dolar AS',
  EUR: 'euro',
  JPY: 'yen',
  GBP: 'pound sterling',
  CNY: 'yuan',
  CHF: 'franc Swiss',
  AUD: 'dolar Australia',
  SGD: 'dolar Singapura',
  IDR: 'rupiah',
  MYR: 'ringgit',
  SAR: 'riyal Saudi',
  KRW: 'won',
  HKD: 'dolar Hong Kong',
};

export const currencyName = (code: string) => NAMES[code] ?? code;

/** Huruf pertama kapital, untuk awal kalimat atau label. */
export const currencyLabel = (code: string) => {
  const name = currencyName(code);
  return name.charAt(0).toUpperCase() + name.slice(1);
};

/**
 * Pilihan mata uang untuk SelectMenu: bendera dan kode sebagai label, nama
 * Indonesia di bawahnya ("Dolar Amerika Serikat"). Nama Inggris ikut dicari,
 * jadi "dollar" dan "dolar" sama-sama menemukan USD.
 */
export const currencyOptions = (currencies: Currency[]) =>
  currencies.map((c) => ({
    value: c.code,
    label: c.code,
    icon: currencyToFlag(c.code) ?? undefined,
    hint: c.localName,
    keywords: c.name,
  }));
