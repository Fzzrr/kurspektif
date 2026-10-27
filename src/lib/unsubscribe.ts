// Tautan berhenti berlangganan ringkasan mingguan. Ditandatangani HMAC dengan
// AUTH_SECRET, jadi tidak perlu menyimpan token di database: hanya server yang
// bisa membuat tanda tangan yang cocok untuk sebuah userId.
import { createHmac, timingSafeEqual } from 'node:crypto';

function sign(userId: string, secret: string): string {
  return createHmac('sha256', secret).update(`unsubscribe:${userId}`).digest('base64url');
}

export function unsubscribeToken(userId: string, secret = process.env.AUTH_SECRET ?? ''): string {
  return sign(userId, secret);
}

export function verifyUnsubscribeToken(
  userId: string,
  token: string,
  secret = process.env.AUTH_SECRET ?? '',
): boolean {
  if (!secret || !userId || !token) return false;
  const expected = Buffer.from(sign(userId, secret));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

/** Halaman konfirmasi (untuk tautan di isi email). */
export const unsubscribePageUrl = (baseUrl: string, userId: string) =>
  `${baseUrl}/berhenti-langganan?u=${encodeURIComponent(userId)}&t=${unsubscribeToken(userId)}`;

/** Endpoint sekali klik (untuk header List-Unsubscribe, RFC 8058). */
export const unsubscribeApiUrl = (baseUrl: string, userId: string) =>
  `${baseUrl}/api/unsubscribe?u=${encodeURIComponent(userId)}&t=${unsubscribeToken(userId)}`;
