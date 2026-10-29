export function formatTimeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(diffMs / 86_400_000);

  if (minutes < 1) return 'Baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days === 1) return 'Kemarin';
  return `${days} hari lalu`;
}

/** true kalau `iso` terbit dalam `days` hari terakhir. */
export function isWithinDays(iso: string, days: number): boolean {
  return Date.now() - new Date(iso).getTime() < days * 86_400_000;
}

// Zona waktu dikunci ke Jakarta supaya server dan client menghasilkan kunci
// hari yang sama — kalau ikut zona pengunjung, pengelompokan bisa berbeda
// antara SSR dan hidrasi.
const dayKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Jakarta',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
const dayLabelFormatter = new Intl.DateTimeFormat('id-ID', {
  timeZone: 'Asia/Jakarta',
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});

const timeFormatter = new Intl.DateTimeFormat('id-ID', {
  timeZone: 'Asia/Jakarta',
  hour: '2-digit',
  minute: '2-digit',
});

/** Jam terbit WIB, mis. "09.42". */
export function timeOfDay(iso: string): string {
  return timeFormatter.format(new Date(iso));
}

/** Kunci kalender "YYYY-MM-DD" (Jakarta) — bisa diurutkan sebagai string. */
export function dayKey(iso: string | number | Date): string {
  return dayKeyFormatter.format(new Date(iso));
}

/** "Hari ini" / "Kemarin" / "Sen, 14 Sep" untuk kunci dari dayKey(). */
export function dayLabel(key: string): string {
  const now = Date.now();
  if (key === dayKey(now)) return 'Hari ini';
  if (key === dayKey(now - 86_400_000)) return 'Kemarin';
  return dayLabelFormatter.format(new Date(`${key}T12:00:00+07:00`));
}

/** Kunci hari ini (Jakarta). */
export const todayKey = () => dayKey(Date.now());

/** Hari pertama kurs referensi ECB (dan Frankfurter) tersedia. */
export const FIRST_RATE_DATE = '1999-01-04';

/** "YYYY-MM-DD" yang benar-benar ada di kalender, antara FIRST_RATE_DATE dan hari ini; selain itu null. */
export function parseRateDate(raw: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const date = new Date(`${raw}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== raw) return null;
  return raw >= FIRST_RATE_DATE && raw <= todayKey() ? raw : null;
}
