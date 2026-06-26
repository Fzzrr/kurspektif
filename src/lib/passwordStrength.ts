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
      return 'Terlalu lemah';
    case 1:
      return 'Lemah';
    case 2:
      return 'Sedang';
    case 3:
      return 'Kuat';
    default:
      return 'Sangat kuat';
  }
}

/** Saran perbaikan berikutnya berdasarkan apa yang belum dipenuhi password. */
export function strengthHint(password: string): string {
  if (password.length < 8) return 'tambah hingga 8+ karakter';
  if (!(/[a-z]/.test(password) && /[A-Z]/.test(password)))
    return 'campur huruf besar & kecil';
  if (!/\d/.test(password)) return 'tambahkan angka';
  if (!/[^A-Za-z0-9]/.test(password)) return 'tambahkan simbol (!@#$)';
  return 'mantap, password sudah kuat';
}
