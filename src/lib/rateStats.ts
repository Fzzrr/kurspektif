// Angka turunan dari seri kurs — dipakai dashboard (client) dan halaman kurs
// publik (server), jadi tinggal di sini, bukan di komponen 'use client'.
import { percentileOf } from './alerts';
import type { RatePoint } from './frankfurter';

export const formatRate = (value: number) =>
  new Intl.NumberFormat('id-ID', { maximumSignificantDigits: 6 }).format(value);

const pctFormatter = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 3 });

/** Perubahan hari terakhir dibanding hari sebelumnya. */
export function dailyChange(series: RatePoint[], latest: RatePoint | null) {
  if (!latest || series.length < 2) return { changeAbsolute: '—', changePercent: 'Memuat…', changeDir: undefined };
  const prev = series[series.length - 2].rate;
  const diff = latest.rate - prev;
  const changePercent = `${pctFormatter.format(Math.abs((diff / prev) * 100))}%`;
  // Yang tampil "0%" tidak diberi warna naik/turun.
  const changeDir = changePercent === '0%' ? ('flat' as const) : diff > 0 ? ('up' as const) : ('down' as const);
  return { changeAbsolute: formatRate(Math.abs(diff)), changePercent, changeDir };
}

/** Posisi kurs terbaru dalam 90 hari kerja terakhir. */
export function historicalPosition(series: RatePoint[], latest: RatePoint | null) {
  const window = series.slice(-90);
  if (!latest || window.length < 2) return { label: 'Memuat…', min: '-', max: '-', percentile: 50 };
  const rates = window.map((p) => p.rate);
  const percentile = percentileOf(latest.rate, rates);
  return {
    label: `Lebih tinggi dari ${percentile}% hari (${window.length} hari terakhir)`,
    min: formatRate(Math.min(...rates)),
    max: formatRate(Math.max(...rates)),
    percentile,
  };
}
