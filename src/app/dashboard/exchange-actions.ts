'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { exchangeLimiter } from '@/lib/rateLimit';
import { parseThreshold } from '@/lib/alerts';
import { fetchRateOnOrBefore } from '@/lib/frankfurter';
import { formatRate } from '@/lib/rateStats';
import { parseRateDate } from '@/lib/timeAgo';
import { MAX_RECORDS, SIDES, toExchangeDTO, type ExchangeDTO, type ExchangeInput } from '@/lib/exchanges';

const CURRENCY_CODE = /^[A-Z]{3}$/;
// Kurs yang melenceng lebih jauh dari ini dari kurs tengah hampir pasti salah
// ketik atau pasangan terbalik (mis. 0,000055 untuk USD/IDR), bukan biaya bank.
const MAX_DEVIATION = 0.25;

async function currentUserId(): Promise<string | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;
  return (await exchangeLimiter.check(`exchange:${userId}`)).success ? userId : null;
}

export async function createExchangeAction(input: ExchangeInput): Promise<{ record: ExchangeDTO } | { error: string }> {
  const userId = await currentUserId();
  if (!userId) return { error: 'Sesi berakhir atau terlalu banyak permintaan. Coba lagi.' };

  const base = input.base.toUpperCase();
  const quote = input.quote.toUpperCase();
  if (!CURRENCY_CODE.test(base) || !CURRENCY_CODE.test(quote)) return { error: 'Kode mata uang tidak valid.' };
  if (base === quote) return { error: 'Pilih dua mata uang yang berbeda.' };
  if (!SIDES.includes(input.side)) return { error: 'Pilih beli atau jual.' };
  const amount = parseThreshold(input.amount);
  if (amount === null) return { error: `Jumlah ${base} harus angka lebih dari 0.` };
  const rate = parseThreshold(input.rate);
  if (rate === null) return { error: 'Kurs harus angka lebih dari 0.' };
  const date = parseRateDate(input.date);
  if (!date) return { error: 'Tanggal harus antara 4 Januari 1999 dan hari ini.' };
  const place = input.place.trim().slice(0, 60) || null;

  if ((await prisma.exchangeRecord.count({ where: { userId } })) >= MAX_RECORDS) {
    return { error: `Maksimal ${MAX_RECORDS} catatan. Hapus catatan lama untuk menambah yang baru.` };
  }

  const mid = await fetchRateOnOrBefore(base, quote, date).catch(() => null);
  if (!mid) return { error: `Kurs tengah ${base}/${quote} untuk tanggal itu belum bisa diambil. Coba lagi, atau pilih tanggal lain.` };
  if (Math.abs(rate / mid.rate - 1) > MAX_DEVIATION) {
    return {
      error: `Kurs yang kamu isi jauh dari kurs tengah hari itu (${formatRate(mid.rate)} ${quote} per 1 ${base}). Periksa lagi angkanya, atau apakah pasangannya terbalik.`,
    };
  }

  const row = await prisma.exchangeRecord.create({
    data: { userId, side: input.side, base, quote, amount, rate, date, midRate: mid.rate, midDate: mid.date, place },
  });
  return { record: toExchangeDTO(row) };
}

export async function deleteExchangeAction(id: string): Promise<{ error?: string }> {
  const userId = await currentUserId();
  if (!userId) return { error: 'Sesi berakhir atau terlalu banyak permintaan. Coba lagi.' };
  // deleteMany + userId: tidak bisa menghapus catatan milik orang lain.
  await prisma.exchangeRecord.deleteMany({ where: { id, userId } });
  return {};
}
