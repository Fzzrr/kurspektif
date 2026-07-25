import DashboardHeader from '@/components/dashboard/DashboardHeader';
import PairSelector from '@/components/dashboard/PairSelector';
import StatCardsRow from '@/components/dashboard/StatCardsRow';
import RateChartCard from '@/components/dashboard/RateChartCard';
import InsightRow from '@/components/dashboard/InsightRow';
import AlertCard from '@/components/dashboard/AlertCard';
import { UPDATED_AT } from '@/lib/mock/dashboard';

// Server Component: tidak ada state/efek di level halaman ini sendiri —
// semua interaktivitas hidup di komponen anak yang butuh ('use client').
// Menyusun (compose) section demi section persis urutan di desain PDF.
export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <DashboardHeader title="Pantau kurs USD/IDR" updatedAt={UPDATED_AT} />
      <PairSelector />
      <StatCardsRow />
      <RateChartCard />
      <InsightRow />
      <AlertCard />
    </div>
  );
}
