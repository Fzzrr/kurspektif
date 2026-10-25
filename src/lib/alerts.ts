// Tipe & helper alert kurs yang aman dipakai di client maupun server
// (tanpa Prisma). Penyimpanan ada di app/dashboard/alert-actions.ts,
// pengecekan berkala di app/api/cron/check-alerts.

// 'atas'/'bawah': threshold = angka kurs. 'murah'/'mahal': threshold = persen —
// kurs masuk X% hari termurah/termahal dalam setahun terakhir.
export type AlertDirection = 'atas' | 'bawah' | 'murah' | 'mahal';
export const DIRECTIONS: readonly AlertDirection[] = ['atas', 'bawah', 'murah', 'mahal'];

/** Jendela riwayat untuk alert posisi. */
export const POSITION_DAYS = 365;
export const POSITION_PERCENTS = [10, 20, 30] as const;

export const isPositional = (direction: AlertDirection) => direction === 'murah' || direction === 'mahal';

export type RateAlertDTO = {
  id: string;
  base: string;
  quote: string;
  direction: AlertDirection;
  threshold: number;
  /** ISO; null = belum tercapai (masih aktif). */
  triggeredAt: string | null;
  triggeredRate: number | null;
};

export type AlertInput = { base: string; quote: string; direction: AlertDirection; threshold: string };

/** Angka format Indonesia ("16.500", "0,000056") → number; null kalau tidak valid. */
export function parseThreshold(raw: string): number | null {
  const value = Number(raw.trim().replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(value) && value > 0 ? value : null;
}

/** Persen hari dalam `history` yang kursnya lebih rendah dari `rate` (0–100). */
export function percentileOf(rate: number, history: number[]): number {
  if (history.length === 0) return 50;
  return Math.round((history.filter((value) => value < rate).length / history.length) * 100);
}

/** `percentile` hanya dipakai alert posisi ('murah'/'mahal'). */
export function isHit(direction: AlertDirection, rate: number, threshold: number, percentile: number | null): boolean {
  switch (direction) {
    case 'atas':
      return rate >= threshold;
    case 'bawah':
      return rate <= threshold;
    case 'murah':
      return percentile !== null && percentile <= threshold;
    case 'mahal':
      return percentile !== null && percentile >= 100 - threshold;
  }
}

/** Kalimat kondisi, mis. "naik di atas 16.500 IDR" / "masuk 20% termurah setahun". */
export function describeCondition(direction: AlertDirection, threshold: string, quote: string): string {
  switch (direction) {
    case 'atas':
      return `naik di atas ${threshold} ${quote}`;
    case 'bawah':
      return `turun di bawah ${threshold} ${quote}`;
    case 'murah':
      return `masuk ${threshold}% termurah setahun`;
    case 'mahal':
      return `masuk ${threshold}% termahal setahun`;
  }
}

export function toAlertDTO(row: {
  id: string;
  base: string;
  quote: string;
  direction: string;
  threshold: number;
  triggeredAt: Date | null;
  triggeredRate: number | null;
}): RateAlertDTO {
  return {
    id: row.id,
    base: row.base,
    quote: row.quote,
    direction: DIRECTIONS.find((d) => d === row.direction) ?? 'atas',
    threshold: row.threshold,
    triggeredAt: row.triggeredAt?.toISOString() ?? null,
    triggeredRate: row.triggeredRate,
  };
}
