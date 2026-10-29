// Pemeriksaan bersama untuk server action: siapa yang masuk, dan apakah masih
// dalam batas limiter. Bukan berkas 'use server' — ekspor dari sana menjadi
// endpoint publik.
import { auth } from '.';

type Limiter = { check(key: string): Promise<{ success: boolean }> };

export const SESSION_ERROR = 'Sesi berakhir atau terlalu banyak permintaan. Coba lagi.';

/** userId pengguna yang sedang masuk, atau null kalau belum masuk atau melewati batas `limiter`. */
export async function actionUserId(limiter: Limiter, scope: string): Promise<string | null> {
  const userId = (await auth())?.user?.id;
  if (!userId) return null;
  return (await limiter.check(`${scope}:${userId}`)).success ? userId : null;
}
