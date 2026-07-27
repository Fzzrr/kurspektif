import { fetchSupportedCurrencies } from '@/lib/frankfurter';
import DashboardLiveSection from '@/components/dashboard/DashboardLiveSection';
import InsightRow from '@/components/dashboard/InsightRow';
import AlertCard from '@/components/dashboard/AlertCard';

export default async function DashboardPage() {
  const currencies = await fetchSupportedCurrencies();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <DashboardLiveSection title="Pantau kurs Anda Saat Ini" currencies={currencies} />
      <InsightRow />
      <AlertCard />
    </div>
  );
}