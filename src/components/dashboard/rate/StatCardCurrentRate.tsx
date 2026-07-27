'use client';

// Kartu "kurs saat ini". Client Component karena memakai CountUp (yang
// mengamati viewport lewat IntersectionObserver di browser).
import CountUp from '@/components/landing/motion/CountUp';
import DashboardCard from '../ui/DashboardCard';

type Props = {
  rate?: string;
  changePercent?: string;
  changeAbsolute?: string;
  changeDir?: 'up' | 'down';
};

export default function StatCardCurrentRate({
  rate = '16.234',
  changePercent = '0,8%',
  changeDir = 'down',
}: Props) {
  const isUp = changeDir === 'up';

  return (
    <DashboardCard>
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Kurs saat ini</p>
      <p className="mt-3 font-mono text-3xl font-medium tracking-tight">
        <CountUp value={rate} />
      </p>
      <p className={`mt-1 font-mono text-sm ${isUp ? 'text-up' : 'text-down'}`}>
        {isUp ? '↑' : '↓'} {changePercent} Hari ini
      </p>
    </DashboardCard>
  );
}
