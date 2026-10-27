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
