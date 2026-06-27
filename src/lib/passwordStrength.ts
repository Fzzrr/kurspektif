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

/** Warna yang mewakili tingkat kekuatan: merah → emas → hijau. */
export function strengthColor(score: number): string {
  if (score <= 1) return 'var(--color-down)';
  if (score === 2) return 'var(--color-accent)';
  return 'var(--color-up)';
}

/**
 * Warna bar indikator pada posisi `index` untuk `score` tertentu.
 * Belum tercapai = garis netral; tercapai = merah → emas → hijau.
 */
export function strengthBarColor(index: number, score: number): string {
  if (index >= score) return 'var(--color-line)';
  return strengthColor(score);
}

/** Label kekuatan password sesuai skor 0–4. */
export function strengthLabel(score: number): string {
  switch (score) {
    case 0:
      return 'Too weak';
    case 1:
      return 'Weak';
    case 2:
      return 'Fair';
    case 3:
      return 'Strong';
    default:
      return 'Very strong';
  }
}

/** Saran perbaikan berikutnya berdasarkan apa yang belum dipenuhi password. */
export function strengthHint(password: string): string {
  if (password.length < 8) return 'use at least 8 characters';
  if (!(/[a-z]/.test(password) && /[A-Z]/.test(password)))
    return 'mix uppercase & lowercase';
  if (!/\d/.test(password)) return 'add a number';
  if (!/[^A-Za-z0-9]/.test(password)) return 'add a symbol (!@#$)';
  return 'great, your password is strong';
}
