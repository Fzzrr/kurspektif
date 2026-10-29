'use server';

import { revalidatePath } from 'next/cache';
import { SESSION_ERROR, actionUserId } from '@/lib/auth/action';
import { isCurrencyCode } from '@/lib/pairs';
import { prisma } from '@/lib/prisma';
import { alertLimiter } from '@/lib/rateLimit';
import {
  DIRECTIONS,
  POSITION_PERCENTS,
  isPositional,
  parseThreshold,
  toAlertDTO,
  type AlertInput,
  type RateAlertDTO,
} from '@/lib/alerts';

type Result = { alert: RateAlertDTO; error?: undefined } | { error: string };

const MAX_ACTIVE_ALERTS = 20;


function validate(input: AlertInput) {
  const base = input.base.toUpperCase();
  const quote = input.quote.toUpperCase();
  if (!isCurrencyCode(base) || !isCurrencyCode(quote)) return { error: 'Kode mata uang tidak valid.' };
  if (base === quote) return { error: 'Pilih dua mata uang yang berbeda.' };
  if (!DIRECTIONS.includes(input.direction)) return { error: 'Kondisi tidak valid.' };
  const threshold = parseThreshold(input.threshold);
  if (isPositional(input.direction)) {
    if (!POSITION_PERCENTS.some((p) => p === threshold)) return { error: 'Pilih 10%, 20%, atau 30%.' };
  } else if (threshold === null) {
    return { error: 'Batas kurs harus angka lebih dari 0.' };
  }
  return { data: { base, quote, direction: input.direction, threshold: threshold! } };
}

export async function createAlertAction(input: AlertInput): Promise<Result> {
  const userId = await actionUserId(alertLimiter, 'alert');
  if (!userId) return { error: SESSION_ERROR };

  const parsed = validate(input);
  if (!parsed.data) return { error: parsed.error };

  const active = await prisma.rateAlert.count({ where: { userId, triggeredAt: null } });
  if (active >= MAX_ACTIVE_ALERTS) return { error: `Maksimal ${MAX_ACTIVE_ALERTS} alert aktif.` };

  const alert = await prisma.rateAlert.create({ data: { userId, ...parsed.data } });
  revalidatePath('/dashboard', 'layout'); // jumlah alert aktif di menu akun
  return { alert: toAlertDTO(alert) };
}

// Mengedit = menetapkan target baru, jadi alert yang sudah tercapai aktif lagi.
export async function updateAlertAction(id: string, input: AlertInput): Promise<Result> {
  const userId = await actionUserId(alertLimiter, 'alert');
  if (!userId) return { error: SESSION_ERROR };

  const parsed = validate(input);
  if (!parsed.data) return { error: parsed.error };

  const owned = await prisma.rateAlert.findFirst({ where: { id, userId }, select: { id: true } });
  if (!owned) return { error: 'Alert tidak ditemukan.' };

  const alert = await prisma.rateAlert.update({
    where: { id },
    data: { ...parsed.data, triggeredAt: null, triggeredRate: null },
  });
  revalidatePath('/dashboard', 'layout');
  return { alert: toAlertDTO(alert) };
}

export async function deleteAlertAction(id: string): Promise<{ error?: string }> {
  const userId = await actionUserId(alertLimiter, 'alert');
  if (!userId) return { error: SESSION_ERROR };

  // deleteMany + userId: tidak bisa menghapus alert milik orang lain.
  await prisma.rateAlert.deleteMany({ where: { id, userId } });
  revalidatePath('/dashboard', 'layout');
  return {};
}
