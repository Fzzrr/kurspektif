import { auth } from '@/lib/auth';
import { fetchSupportedCurrencies } from '@/lib/frankfurter';
import { fetchCurrencyNews, type NewsItem } from '@/lib/marketaux';
import { prisma } from '@/lib/prisma';
import { toAlertDTO } from '@/lib/alerts';
import DashboardLiveSection from '@/components/dashboard/DashboardLiveSection';
import AlertCard from '@/components/dashboard/AlertCard';

export default async function DashboardPage() {
  const [session, currencies] = await Promise.all([auth(), fetchSupportedCurrencies()]);
  const userId = session?.user?.id;
  const alerts = userId
    ? await prisma.rateAlert.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } })
    : [];

  let news: NewsItem[] = [];
  try {
    news = await fetchCurrencyNews();
  } catch (err) {
    console.error('Gagal mengambil berita:', err);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <DashboardLiveSection
        title="Pantau kurs Anda Saat Ini"
        currencies={currencies}
        news={news}
        userId={session?.user?.id ?? 'anon'}
      />
      <AlertCard currencies={currencies} initialAlerts={alerts.map(toAlertDTO)} />
    </div>
  );
}
