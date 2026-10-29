'use server';

import { revalidatePath } from 'next/cache';
import { SESSION_ERROR, actionUserId } from '@/lib/auth/action';
import { isCurrencyCode } from '@/lib/pairs';
import { prisma } from '@/lib/prisma';
import { watchlistLimiter } from '@/lib/rateLimit';
import { MAX_PAIRS, watchedPairs } from '@/lib/watchlist';



// Simpan pasangan kalau belum ada, hapus kalau sudah ada. Mengembalikan
// daftar terbaru supaya client tidak perlu menebak hasilnya.
export async function toggleWatchAction(base: string, quote: string): Promise<{ pairs: string[] } | { error: string }> {
  const userId = await actionUserId(watchlistLimiter, 'watchlist');
  if (!userId) return { error: SESSION_ERROR };
  if (!isCurrencyCode(base) || !isCurrencyCode(quote) || base === quote) {
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
  revalidatePath('/dashboard', 'layout'); // jumlah pantauan di menu akun
  return { pairs: await watchedPairs(userId) };
}

export async function setWeeklyDigestAction(enabled: boolean): Promise<{ error?: string }> {
  const userId = await actionUserId(watchlistLimiter, 'watchlist');
  if (!userId) return { error: SESSION_ERROR };
  await prisma.user.update({ where: { id: userId }, data: { weeklyDigest: enabled } });
  return {};
}

export async function setMoveAlertsAction(enabled: boolean): Promise<{ error?: string }> {
  const userId = await actionUserId(watchlistLimiter, 'watchlist');
  if (!userId) return { error: SESSION_ERROR };
  await prisma.user.update({ where: { id: userId }, data: { moveAlerts: enabled } });
  return {};
}
