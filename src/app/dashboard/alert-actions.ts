'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { alertLimiter } from '@/lib/rateLimit';
import { parseThreshold, toAlertDTO, type AlertInput, type RateAlertDTO } from '@/lib/alerts';

type Result = { alert: RateAlertDTO; error?: undefined } | { error: string };

const MAX_ACTIVE_ALERTS = 20;
const CURRENCY_CODE = /^[A-Z]{3}$/;

async function currentUserId(): Promise<string | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;
  return (await alertLimiter.check(`alert:${userId}`)).success ? userId : null;
}

function validate(input: AlertInput) {
  const base = input.base.toUpperCase();
  const quote = input.quote.toUpperCase();
  if (!CURRENCY_CODE.test(base) || !CURRENCY_CODE.test(quote)) return { error: 'Kode mata uang tidak valid.' };
  if (base === quote) return { error: 'Pilih dua mata uang yang berbeda.' };
  if (input.direction !== 'atas' && input.direction !== 'bawah') return { error: 'Kondisi tidak valid.' };
  const threshold = parseThreshold(input.threshold);
  if (threshold === null) return { error: 'Batas kurs harus angka lebih dari 0.' };
  return { data: { base, quote, direction: input.direction, threshold } };
}

export async function createAlertAction(input: AlertInput): Promise<Result> {
  const userId = await currentUserId();
  if (!userId) return { error: 'Sesi berakhir atau terlalu banyak permintaan. Coba lagi.' };

  const parsed = validate(input);
  if (!parsed.data) return { error: parsed.error };

  const active = await prisma.rateAlert.count({ where: { userId, triggeredAt: null } });
  if (active >= MAX_ACTIVE_ALERTS) return { error: `Maksimal ${MAX_ACTIVE_ALERTS} alert aktif.` };

  const alert = await prisma.rateAlert.create({ data: { userId, ...parsed.data } });
  return { alert: toAlertDTO(alert) };
}

// Mengedit = menetapkan target baru, jadi alert yang sudah tercapai aktif lagi.
export async function updateAlertAction(id: string, input: AlertInput): Promise<Result> {
  const userId = await currentUserId();
  if (!userId) return { error: 'Sesi berakhir atau terlalu banyak permintaan. Coba lagi.' };

  const parsed = validate(input);
  if (!parsed.data) return { error: parsed.error };

  const owned = await prisma.rateAlert.findFirst({ where: { id, userId }, select: { id: true } });
  if (!owned) return { error: 'Alert tidak ditemukan.' };

  const alert = await prisma.rateAlert.update({
    where: { id },
    data: { ...parsed.data, triggeredAt: null, triggeredRate: null },
  });
  return { alert: toAlertDTO(alert) };
}

export async function deleteAlertAction(id: string): Promise<{ error?: string }> {
  const userId = await currentUserId();
  if (!userId) return { error: 'Sesi berakhir atau terlalu banyak permintaan. Coba lagi.' };

  // deleteMany + userId: tidak bisa menghapus alert milik orang lain.
  await prisma.rateAlert.deleteMany({ where: { id, userId } });
  return {};
}
