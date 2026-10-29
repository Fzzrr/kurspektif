// Kabar "pergerakan tajam": pasangan di Pantauan yang bergerak cukup jauh dari
// hari kerja sebelumnya. Dicek oleh cron harian (api/cron/check-alerts).
import type { RatePoint } from './frankfurter';

// ponytail: ambang tetap 1%/hari untuk semua pasangan; ganti ke kelipatan
// volatilitas harian historis per pasangan kalau pasangan yang memang liar
// terlalu sering memicu kabar (atau yang sangat stabil tidak pernah).
export const SHARP_MOVE_PCT = 1;

export type DailyMove = { date: string; rate: number; prevDate: string; prevRate: number; pct: number };

/** Perubahan hari kerja terakhir dibanding sebelumnya; null kalau datanya kurang dari dua hari. */
export function dailyMove(series: RatePoint[]): DailyMove | null {
  if (series.length < 2) return null;
  const { date, rate } = series[series.length - 1];
  const { date: prevDate, rate: prevRate } = series[series.length - 2];
  return { date, rate, prevDate, prevRate, pct: (rate / prevRate - 1) * 100 };
}

/**
 * Gerak tajam yang belum pernah dikabarkan. `lastMoveDate` = tanggal kurs yang
 * terakhir dikabarkan untuk pasangan ini; kurs yang sama tidak dikabarkan dua kali.
 */
export function newSharpMove(series: RatePoint[], lastMoveDate: string | null): DailyMove | null {
  const move = dailyMove(series);
  if (!move || Math.abs(move.pct) < SHARP_MOVE_PCT) return null;
  if (lastMoveDate && lastMoveDate >= move.date) return null;
  return move;
}
