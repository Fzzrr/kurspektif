// Logika penilaian kekuatan password, dipisah dari komponen agar mudah diuji.

/** Skor kekuatan password dari 0 (lemah) sampai 4 (kuat). */
export function strengthOf(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

/**
 * Warna bar indikator pada posisi `index` untuk `score` tertentu.
 * Belum tercapai = garis netral; tercapai = merah → emas → hijau.
 */
export function strengthBarColor(index: number, score: number): string {
  if (index >= score) return 'var(--color-line)';
  if (score <= 1) return 'var(--color-down)';
  if (score === 2) return 'var(--color-accent)';
  return 'var(--color-up)';
}
