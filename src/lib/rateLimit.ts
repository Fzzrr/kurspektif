// Abstraksi rate limiter satu-pintu.
// Sekarang pakai in-memory (gratis, untuk dev). Saat produksi, cukup set env
// Upstash dan aktifkan blok di bawah — call site (auth.ts/actions.ts) tak berubah.

export interface RateLimiter {
  /** true = masih dalam batas (boleh lanjut). */
  check(key: string): Promise<{ success: boolean }>;
}

type Options = { limit: number; windowMs: number };

/**
 * Sliding-window log: simpan daftar timestamp tiap key, buang yang lebih tua
 * dari window. Lebih aman dari "fixed window" karena tak ada celah burst di
 * batas jendela (mis. 5 di detik ke-59 + 5 di detik ke-61).
 */
function createMemoryLimiter({ limit, windowMs }: Options): RateLimiter {
  const hits = new Map<string, number[]>();

  return {
    async check(key) {
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

/**
 * Pemilih implementasi. Kalau env Upstash ada → pakai Redis (produksi),
 * selain itu → memory (dev). Lihat blok Upstash di bawah untuk mengaktifkan.
 */
function createLimiter(opts: Options): RateLimiter {
  // if (process.env.UPSTASH_REDIS_REST_URL) return createUpstashLimiter(opts);
  return createMemoryLimiter(opts);
}

// --- Instance siap pakai ---
export const loginLimiter = createLimiter({ limit: 5, windowMs: 60_000 });    // 5/menit per IP+email
export const loginIpLimiter = createLimiter({ limit: 30, windowMs: 60_000 }); // 30/menit per IP
export const registerLimiter = createLimiter({ limit: 5, windowMs: 60_000 }); // 5/menit per IP
export const profileUpdateLimiter = createLimiter({ limit: 10, windowMs: 60_000 });
export const passwordChangeLimiter = createLimiter({ limit: 5, windowMs: 60_000 });
export const emailChangeLimiter = createLimiter({ limit: 3, windowMs: 15 * 60_000 });