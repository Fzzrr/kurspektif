'use client';

// Kartu "kurs saat ini". Client Component karena memakai CountUp (yang
// mengamati viewport lewat IntersectionObserver di browser).
import { useId } from 'react';
import CountUp from '@/components/landing/motion/CountUp';
import DashboardCard from '../ui/DashboardCard';

type Props = {
  rate?: string;
  changePercent?: string;
  changeDir?: 'up' | 'down';
  pair?: string;
  /** Kurs harian terakhir (urut lama → baru) untuk sparkline. */
  sparkline?: number[];
};

export default function StatCardCurrentRate({
  rate = '16.234',
  changePercent = '0,8%',
  changeDir,
  pair,
  sparkline = [],
}: Props) {
  const isUp = changeDir === 'up';
  const loaded = changeDir !== undefined;
  const tone = !loaded ? 'bg-accent-soft text-muted' : isUp ? 'bg-up/15 text-up' : 'bg-down/15 text-down';

  return (
    <DashboardCard className="relative overflow-hidden">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-xs text-muted">Kurs Saat Ini</p>
        {pair && (
          <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[10px] text-muted">{pair}</span>
        )}
      </div>

      <p className="mt-3 font-mono text-3xl font-semibold tracking-tight">
        <CountUp value={rate} />
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-xs font-medium ${tone}`}>
          {loaded && (isUp ? '↑' : '↓')} {changePercent}
        </span>
        {loaded && <span className="font-mono text-xs text-muted">Hari Ini</span>}
      </div>
      {sparkline.length > 1 && <Sparkline values={sparkline} up={isUp} />}
    </DashboardCard>
  );
}

// Sparkline SVG kecil di dasar kartu: garis + isian gradien memudar, warna
// mengikuti arah perubahan. `preserveAspectRatio="none"` agar meregang
// mengikuti lebar kartu tanpa mengubah tinggi.
function Sparkline({ values, up }: { values: number[]; up: boolean }) {
  const gradientId = useId();
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const stepX = 100 / (values.length - 1);
  const points = values.map((v, i) => `${(i * stepX).toFixed(2)},${(30 - ((v - min) / span) * 28).toFixed(2)}`);
  const line = points.join(' ');
  const area = `0,32 ${line} 100,32`;
  const color = up ? 'var(--color-up)' : 'var(--color-down)';

  return (
    <svg
      viewBox="0 0 100 32"
      preserveAspectRatio="none"
      aria-hidden
      className="pointer-events-none mt-4 h-10 w-full"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gradientId})`} />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
