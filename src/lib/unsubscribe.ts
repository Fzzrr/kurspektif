// Tautan berhenti berlangganan email rutin. Ditandatangani HMAC dengan
// AUTH_SECRET, jadi tidak perlu menyimpan token di database: hanya server yang
// bisa membuat tanda tangan yang cocok untuk sebuah userId dan jenis email.
import { createHmac, timingSafeEqual } from 'node:crypto';

/** Jenis email yang bisa dihentikan, dan kolom User yang mematikannya. */
export const SUBSCRIPTIONS = {
  ringkasan: { field: 'weeklyDigest', name: 'ringkasan mingguan' },
  gerak: { field: 'moveAlerts', name: 'kabar pergerakan tajam' },
} as const;
export type Subscription = keyof typeof SUBSCRIPTIONS;

/** Nilai `k` di URL → jenis email. Tanpa `k` = ringkasan (tautan lama tetap berlaku). */
export const parseSubscription = (raw: string | null | undefined): Subscription => (raw === 'gerak' ? 'gerak' : 'ringkasan');

// Pesan ringkasan sengaja tetap "unsubscribe:<id>" seperti sebelum ada jenis
// lain, supaya tautan di email yang sudah terkirim tidak rusak.
function sign(userId: string, secret: string, kind: Subscription): string {
  const message = kind === 'ringkasan' ? `unsubscribe:${userId}` : `unsubscribe:${kind}:${userId}`;
  return createHmac('sha256', secret).update(message).digest('base64url');
}

export function unsubscribeToken(userId: string, secret = process.env.AUTH_SECRET ?? '', kind: Subscription = 'ringkasan'): string {
  return sign(userId, secret, kind);
}

export function verifyUnsubscribeToken(
  userId: string,
  token: string,
  secret = process.env.AUTH_SECRET ?? '',
  kind: Subscription = 'ringkasan',
): boolean {
  if (!secret || !userId || !token) return false;
  const expected = Buffer.from(sign(userId, secret, kind));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

function query(userId: string, kind: Subscription) {
  const params = new URLSearchParams({ u: userId, t: unsubscribeToken(userId, undefined, kind) });
  if (kind !== 'ringkasan') params.set('k', kind);
  return params.toString();
}

/** Halaman konfirmasi (untuk tautan di isi email). */
export const unsubscribePageUrl = (baseUrl: string, userId: string, kind: Subscription = 'ringkasan') =>
  `${baseUrl}/berhenti-langganan?${query(userId, kind)}`;

/** Endpoint sekali klik (untuk header List-Unsubscribe, RFC 8058). */
export const unsubscribeApiUrl = (baseUrl: string, userId: string, kind: Subscription = 'ringkasan') =>
  `${baseUrl}/api/unsubscribe?${query(userId, kind)}`;
