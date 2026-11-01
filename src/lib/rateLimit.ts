// Rate limiter untuk semua server action, login, dan API publik.
// Kalau UPSTASH_REDIS_REST_URL/TOKEN terisi, hitungan disimpan di Upstash Redis
// sehingga berlaku untuk semua instance serverless. Tanpa itu (dev lokal),
// hitungan disimpan di memori proses: di Vercel tiap instance punya Map sendiri
// dan hilang saat cold start, jadi batasnya bocor. Pemanggil cukup .check(key).
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN ? Redis.fromEnv() : null;

type Options = { limit: number; windowMs: number };

/**
 * Sliding-window log: simpan daftar timestamp tiap key, buang yang lebih tua
 * dari window. Lebih aman dari "fixed window" karena tak ada celah burst di
 * batas jendela (mis. 5 di detik ke-59 + 5 di detik ke-61).
 */
function createLimiter({ limit, windowMs }: Options) {
  // Key dari pemanggil sudah berawalan cakupannya (login:, api:, alert:, ...),
  // jadi satu prefix untuk semua limiter tidak membuat hitungannya bercampur.
  // Gagal terbuka: Redis lambat (> 5 detik, bawaan library) atau error jaringan
  // meloloskan request, supaya gangguan Upstash tidak mematikan login dan aksi.
  if (redis) {
    const upstash = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`), prefix: 'kurspektif' });
    return {
      async check(key: string) {
        try {
          return { success: (await upstash.limit(key)).success };
        } catch (error) {
          console.error('Rate limiter Upstash gagal, request diloloskan:', error);
          return { success: true };
        }
      },
    };
  }

  const hits = new Map<string, number[]>();

  return {
    /** success: true = masih dalam batas (boleh lanjut). */
    async check(key: string) {
      const now = Date.now();
      const fresh = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
      fresh.push(now);
      hits.set(key, fresh);

      // Bersihkan key yang sudah tak relevan agar Map tak membengkak.
      if (hits.size > 10_000) {
        for (const [k, v] of hits) {
          if (v.every((t) => now - t >= windowMs)) hits.delete(k);
        }
      }

      return { success: fresh.length <= limit };
    },
  };
}

// --- Instance siap pakai ---
export const loginLimiter = createLimiter({ limit: 5, windowMs: 60_000 });    // 5/menit per IP+email
export const loginIpLimiter = createLimiter({ limit: 30, windowMs: 60_000 }); // 30/menit per IP
export const registerLimiter = createLimiter({ limit: 5, windowMs: 60_000 }); // 5/menit per IP
export const profileUpdateLimiter = createLimiter({ limit: 10, windowMs: 60_000 });
export const passwordChangeLimiter = createLimiter({ limit: 5, windowMs: 60_000 });
export const emailChangeLimiter = createLimiter({ limit: 3, windowMs: 15 * 60_000 });
export const alertLimiter = createLimiter({ limit: 20, windowMs: 60_000 });     // 20 aksi alert/menit per user
export const watchlistLimiter = createLimiter({ limit: 30, windowMs: 60_000 }); // 30 aksi watchlist/menit per user
export const exchangeLimiter = createLimiter({ limit: 20, windowMs: 60_000 });   // 20 aksi catatan tukar/menit per user
export const passwordResetLimiter = createLimiter({ limit: 5, windowMs: 15 * 60_000 }); // 5 per 15 menit per IP
export const publicApiLimiter = createLimiter({ limit: 60, windowMs: 60_000 }); // 60 request /api/rates & /api/movers per menit per IP

/** IP pengunjung dari header proxy (di Vercel `x-forwarded-for` diisi platform, bukan klien). */
export const clientIp = (headers: Headers) => headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
