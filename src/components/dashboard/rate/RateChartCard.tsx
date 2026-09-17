'use client';

import { useMemo, useState } from 'react';
import RateLineChart, { formatRate } from '@/components/landing/rate/RateLineChart';
import DashboardCard from '../ui/DashboardCard';
import PillTabs from '../ui/PillTabs';
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
const percentFormatter = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 });

type Props = {
  series: RatePoint[];
  pair: string;
  isLoading?: boolean;
};

export default function RateChartCard({ series, pair, isLoading = false }: Props) {
  const [timeframe, setTimeframe] = useState<Timeframe>('30H');

  const windowed = useMemo(() => series.slice(-DAYS_BY_TIMEFRAME[timeframe]), [series, timeframe]);

  const chartData = useMemo(
    () => windowed.map((point) => ({ day: dayLabelFormatter.format(new Date(point.date)), rate: point.rate })),
    [windowed],
  );

  // Ringkasan periode dari data yang sama persis dengan yang digambar, supaya
  // "tertinggi" di header selalu titik yang benar-benar ada di grafik.
  const stats = useMemo(() => {
    if (windowed.length < 2) return null;
    const first = windowed[0].rate;
    const last = windowed[windowed.length - 1].rate;
    const high = windowed.reduce((best, p) => (p.rate > best.rate ? p : best));
    const low = windowed.reduce((best, p) => (p.rate < best.rate ? p : best));
    const average = windowed.reduce((sum, p) => sum + p.rate, 0) / windowed.length;
    return { changePct: ((last - first) / first) * 100, high, low, average };
  }, [windowed]);

  const isUp = (stats?.changePct ?? 0) >= 0;

  return (
    <DashboardCard>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-muted">Grafik Kurs</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="font-mono text-sm text-ink">
              {pair} · {TIMEFRAME_DESCRIPTIONS[timeframe]}
            </p>
            {stats && (
              <span className={`font-mono text-[11px] font-medium ${isUp ? 'text-up' : 'text-down'}`}>
                {isUp ? '+' : '−'}
                {percentFormatter.format(Math.abs(stats.changePct))}%
              </span>
            )}
          </div>
        </div>
        <PillTabs options={TIMEFRAMES} value={timeframe} onChange={setTimeframe} />
      </div>

      {stats && (
        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px]">
          <div>
            <dt className="text-muted">Tertinggi</dt>
            <dd className="mt-0.5 text-ink">
              {formatRate(stats.high.rate)}
              <span className="text-muted"> · {dayLabelFormatter.format(new Date(stats.high.date))}</span>
            </dd>
          </div>
          <div>
            <dt className="text-muted">Terendah</dt>
            <dd className="mt-0.5 text-ink">
              {formatRate(stats.low.rate)}
              <span className="text-muted"> · {dayLabelFormatter.format(new Date(stats.low.date))}</span>
            </dd>
          </div>
          <div>
            <dt className="text-muted">Rerata</dt>
            <dd className="mt-0.5 text-ink">{formatRate(stats.average)}</dd>
          </div>
        </dl>
      )}

      {isLoading || chartData.length === 0 ? (
        <div className="mt-4 flex h-56 animate-pulse items-center justify-center rounded-xl bg-paper/60 font-mono text-xs text-muted">
          Memuat data kurs…
        </div>
      ) : (
        <RateLineChart data={chartData} className="mt-4 h-56" showAverage />
      )}
    </DashboardCard>
  );
}
