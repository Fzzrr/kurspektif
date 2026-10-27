import { auth } from '@/lib/auth';
import { fetchSupportedCurrencies } from '@/lib/frankfurter';
import { fetchCurrencyNews, type NewsItem } from '@/lib/marketaux';
import { prisma } from '@/lib/prisma';
import { toAlertDTO } from '@/lib/alerts';
import { watchedPairs } from '@/lib/watchlist';
import DashboardLiveSection from '@/components/dashboard/DashboardLiveSection';
import AlertCard from '@/components/dashboard/AlertCard';

// `?pair=USD-IDR` membuka pasangan tertentu (dipakai halaman Pasangan saya).
type Props = { searchParams: Promise<{ pair?: string }> };

export default async function DashboardPage({ searchParams }: Props) {
  const { pair } = await searchParams;
  const initialPair = pair && /^[A-Z]{3}-[A-Z]{3}$/.test(pair) ? pair.replace('-', '/') : undefined;
  const [session, currencies] = await Promise.all([auth(), fetchSupportedCurrencies()]);
  const userId = session?.user?.id;
  const [alerts, watchlist] = userId
    ? await Promise.all([
        prisma.rateAlert.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
        watchedPairs(userId),
      ])
    : [[], []];

  let news: NewsItem[] = [];
  try {
    news = await fetchCurrencyNews();
  } catch (err) {
    console.error('Gagal mengambil berita:', err);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <DashboardLiveSection
        title="Kurs hari ini"
        currencies={currencies}
        news={news}
        initialWatchlist={watchlist}
        initialPair={initialPair}
      />
      {/* Target tautan "Alert" di navigasi. scroll-mt: jangan tertutup header ponsel. */}
      <section id="alert" className="scroll-mt-20 md:scroll-mt-8">
        <AlertCard currencies={currencies} initialAlerts={alerts.map(toAlertDTO)} />
      </section>
    </div>
  );
}
