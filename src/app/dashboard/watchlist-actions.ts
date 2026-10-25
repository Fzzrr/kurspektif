'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { watchlistLimiter } from '@/lib/rateLimit';
import { watchedPairs } from '@/lib/watchlist';

const MAX_PAIRS = 8;
const CURRENCY_CODE = /^[A-Z]{3}$/;

async function currentUserId(): Promise<string | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;
  return (await watchlistLimiter.check(`watchlist:${userId}`)).success ? userId : null;
}

// Simpan pasangan kalau belum ada, hapus kalau sudah ada. Mengembalikan
// daftar terbaru supaya client tidak perlu menebak hasilnya.
export async function toggleWatchAction(base: string, quote: string): Promise<{ pairs: string[] } | { error: string }> {
  const userId = await currentUserId();
  if (!userId) return { error: 'Sesi berakhir atau terlalu banyak permintaan. Coba lagi.' };
  if (!CURRENCY_CODE.test(base) || !CURRENCY_CODE.test(quote) || base === quote) {
    return { error: 'Pasangan tidak valid.' };
  }

  const where = { userId_base_quote: { userId, base, quote } };
  if (await prisma.watchedPair.findUnique({ where })) {
    await prisma.watchedPair.delete({ where });
  } else {
    if ((await prisma.watchedPair.count({ where: { userId } })) >= MAX_PAIRS) {
      return { error: `Maksimal ${MAX_PAIRS} pasangan tersimpan.` };
    }
    await prisma.watchedPair.create({ data: { userId, base, quote } });
  }
  return { pairs: await watchedPairs(userId) };
}

export async function setWeeklyDigestAction(enabled: boolean): Promise<{ error?: string }> {
  const userId = await currentUserId();
  if (!userId) return { error: 'Sesi berakhir atau terlalu banyak permintaan. Coba lagi.' };
  await prisma.user.update({ where: { id: userId }, data: { weeklyDigest: enabled } });
  return {};
}
