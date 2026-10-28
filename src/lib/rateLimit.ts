// Rate limiter in-memory untuk semua server action dan login.
// ponytail: hitungan per instance server — di Vercel tiap instance serverless
// punya Map sendiri dan hilang saat cold start, jadi batasnya bocor di
// produksi. Ganti isi createLimiter dengan @upstash/ratelimit saat deploy;
// call site cukup memanggil .check(key) dan tidak berubah.

type Options = { limit: number; windowMs: number };

/**
 * Sliding-window log: simpan daftar timestamp tiap key, buang yang lebih tua
 * dari window. Lebih aman dari "fixed window" karena tak ada celah burst di
 * batas jendela (mis. 5 di detik ke-59 + 5 di detik ke-61).
 */
function createLimiter({ limit, windowMs }: Options) {
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
export const passwordResetLimiter = createLimiter({ limit: 5, windowMs: 15 * 60_000 }); // 5 per 15 menit per IP
