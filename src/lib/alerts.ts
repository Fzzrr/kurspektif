// Tipe & helper alert kurs yang aman dipakai di client maupun server
// (tanpa Prisma). Penyimpanan ada di app/dashboard/alert-actions.ts,
// pengecekan berkala di app/api/cron/check-alerts.

export type AlertDirection = 'atas' | 'bawah';

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

export const isHit = (direction: AlertDirection, rate: number, threshold: number) =>
  direction === 'atas' ? rate >= threshold : rate <= threshold;

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
    direction: row.direction === 'bawah' ? 'bawah' : 'atas',
    threshold: row.threshold,
    triggeredAt: row.triggeredAt?.toISOString() ?? null,
    triggeredRate: row.triggeredRate,
  };
}
