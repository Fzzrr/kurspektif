// Cara membaca hasil analyzeWeek() — dipakai kartu dashboard, halaman kurs
// publik, dan email ringkasan mingguan, supaya kalimatnya selalu sama.
import type { WeeklyMovers } from './movers';

// ponytail: ambang tetap 0,2%/minggu; ganti ke volatilitas historis per pasangan
// kalau mata uang yang sangat stabil/volatil terasa salah label.
export const STABLE_PCT = 0.2;

const pctFormatter = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2, signDisplay: 'exceptZero' });
export const fmtPct = (value: number) => `${pctFormatter.format(value)}%`;
const absPctFormatter = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 });
/** Besaran persen tanpa tanda: "1,05%" untuk 1,05 maupun -1,05. */
export const fmtAbsPct = (value: number) => `${absPctFormatter.format(Math.abs(value))}%`;
export const isMoving = (value: number) => Math.abs(value) > STABLE_PCT;
const verb = (value: number) => (value > 0 ? 'menguat' : 'melemah');

export function explain({ pairChangePct, sides: [base, quote] }: WeeklyMovers): string {
  if (!isMoving(pairChangePct)) return 'Pasangan ini nyaris tidak berubah minggu ini.';
  const opposite = Math.sign(base.strengthPct) !== Math.sign(quote.strengthPct);
  if (isMoving(base.strengthPct) && isMoving(quote.strengthPct) && opposite) {
    return `Kedua sisi mendorong ke arah yang sama: ${base.code} ${verb(base.strengthPct)}, ${quote.code} ${verb(quote.strengthPct)}.`;
  }
  const driver = Math.abs(base.strengthPct) >= Math.abs(quote.strengthPct) ? base : quote;
  return `Pergerakan minggu ini terutama datang dari sisi ${driver.code}.`;
}
