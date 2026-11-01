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

// Nama sehari-hari yang bisa diketik di landing ("yen ke rupiah"). Nama
// panjang dicek lebih dulu supaya "dolar singapura" tidak terbaca "dolar".
const ALIASES = ([
  ...Object.entries(NAMES).map(([code, name]): [string, string] => [name.toLowerCase(), code]),
  ['dolar', 'USD'],
  ['dollar', 'USD'],
  ['pound', 'GBP'],
  ['franc', 'CHF'],
  ['riyal', 'SAR'],
  ['baht', 'THB'],
  ['rupee', 'INR'],
  ['peso', 'PHP'],
] satisfies [string, string][]).sort((a, b) => b[0].length - a[0].length);

/**
 * "yen ke rupiah", "USD/IDR", "usdidr", "euro dolar" → ['JPY', 'IDR'] dst.
 * Kode tiga huruf yang tidak dikenal tetap dikembalikan; API yang menolaknya.
 * ponytail: nama hanya untuk mata uang di NAMES + beberapa alias; sisanya lewat kode.
 */
export function parsePairQuery(text: string): [string, string] | null {
  let rest = ` ${text.toLowerCase().replace(/[^a-z]+/g, ' ')} `;
  const found: { at: number; code: string }[] = [];
  for (const [name, code] of ALIASES) {
    for (let at = rest.indexOf(` ${name} `); at !== -1; at = rest.indexOf(` ${name} `)) {
      found.push({ at, code });
      rest = rest.slice(0, at) + ' '.repeat(name.length + 1) + rest.slice(at + name.length + 1);
    }
  }
  for (const match of rest.matchAll(/[a-z]+/g)) {
    const word = match[0];
    if (word.length === 3) found.push({ at: match.index, code: word.toUpperCase() });
    if (word.length === 6) {
      found.push({ at: match.index, code: word.slice(0, 3).toUpperCase() });
      found.push({ at: match.index + 3, code: word.slice(3).toUpperCase() });
    }
  }
  const codes = [...new Set(found.sort((a, b) => a.at - b.at).map((f) => f.code))];
  return codes.length >= 2 ? [codes[0], codes[1]] : null;
}
