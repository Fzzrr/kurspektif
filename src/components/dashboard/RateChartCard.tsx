'use client';

import { useMemo, useState } from 'react';
import RateLineChart from '@/components/landing/rate/RateLineChart';
import DashboardCard from './DashboardCard';
import PillTabs from './PillTabs';
import type { RatePoint } from '@/lib/frankfurter';

const TIMEFRAMES = [
  { value: '7H', label: '7H' },
  { value: '30H', label: '30H' },
  { value: '90H', label: '90H' },
  { value: '1T', label: '1T' },
] as const;
type Timeframe = (typeof TIMEFRAMES)[number]['value'];

const DAYS_BY_TIMEFRAME: Record<Timeframe, number> = { '7H': 7, '30H': 30, '90H': 90, '1T': 365 };
const TIMEFRAME_DESCRIPTIONS: Record<Timeframe, string> = {
  '7H': '7 hari terakhir',
  '30H': '30 hari terakhir',
  '90H': '90 hari terakhir',
  '1T': '1 tahun terakhir',
};

const dayLabelFormatter = new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short' });
const MAX_CHART_POINTS = 30;

function sampleSeries(points: RatePoint[], maxPoints: number): RatePoint[] {
  if (points.length <= maxPoints) return points;
  const step = (points.length - 1) / (maxPoints - 1);
  return Array.from({ length: maxPoints }, (_, i) => points[Math.round(i * step)]);
}

type Props = {
  series: RatePoint[];
  pair: string;
  isLoading?: boolean;
};

export default function RateChartCard({ series, pair, isLoading = false }: Props) {
  const [timeframe, setTimeframe] = useState<Timeframe>('30H');

  const chartData = useMemo(() => {
    const windowed = series.slice(-DAYS_BY_TIMEFRAME[timeframe]);
    const sampled = sampleSeries(windowed, MAX_CHART_POINTS);
    return sampled.map((point) => ({
      day: dayLabelFormatter.format(new Date(point.date)),
      rate: point.rate,
    }));
  }, [series, timeframe]);

  return (
    <DashboardCard>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Grafik kurs</p>
          <p className="mt-1 font-mono text-sm text-ink">
            {pair} · {TIMEFRAME_DESCRIPTIONS[timeframe]}
          </p>
        </div>
        <PillTabs options={TIMEFRAMES} value={timeframe} onChange={setTimeframe} />
      </div>

      {isLoading || chartData.length === 0 ? (
        <div className="mt-4 flex h-56 items-center justify-center font-mono text-xs text-muted">
          Memuat data kurs…
        </div>
      ) : (
        <RateLineChart data={chartData} className="mt-4 h-56" />
      )}
    </DashboardCard>
  );
}