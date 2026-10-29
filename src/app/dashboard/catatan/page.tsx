import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { fetchSupportedCurrencies } from '@/lib/frankfurter';
import { toExchangeDTO } from '@/lib/exchanges';
import ExchangeLog from '@/components/dashboard/exchanges/ExchangeLog';

export const metadata = { title: 'Catatan tukar — Kurspektif' };

export default async function CatatanPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const [records, currencies] = await Promise.all([
    userId
      ? prisma.exchangeRecord.findMany({ where: { userId }, orderBy: [{ date: 'desc' }, { createdAt: 'desc' }] })
      : [],
    fetchSupportedCurrencies().catch(() => []),
  ]);

  return <ExchangeLog currencies={currencies} initialRecords={records.map(toExchangeDTO)} />;
}
