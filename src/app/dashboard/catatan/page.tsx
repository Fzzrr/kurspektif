import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { fetchSupportedCurrencies } from '@/lib/frankfurter';
import { EXCHANGE_SELECT, toExchangeDTO } from '@/lib/exchanges';
import ExchangeLog from '@/components/dashboard/exchanges/ExchangeLog';

export const metadata = { title: 'Catatan tukar' };

export default async function CatatanPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const [records, currencies] = await Promise.all([
    userId
      ? prisma.exchangeRecord.findMany({
          where: { userId },
          select: EXCHANGE_SELECT,
          orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        })
      : [],
    fetchSupportedCurrencies().catch(() => []),
  ]);

  return <ExchangeLog currencies={currencies} initialRecords={records.map(toExchangeDTO)} />;
}
