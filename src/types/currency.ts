// Satu titik data kurs untuk grafik (dipakai bersama API route & komponen chart).
export type CurrencyPoint = {
  /** Label pendek "MM-DD" untuk sumbu X. */
  date: string;
  /** Tanggal penuh "YYYY-MM-DD". */
  fullDate: string;
  /** Nilai kurs IDR. */
  rate: number;
};
