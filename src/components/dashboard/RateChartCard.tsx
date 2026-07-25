'use client';

// Kartu grafik kurs. Membungkus RateLineChart (dari landing page) TANPA
// mengubahnya sama sekali — hanya menambahkan header, toggle rentang waktu,
// dan legenda di sekitarnya. Client Component karena toggle rentang waktu
// (`timeframe`) adalah state lokal.

import { useState } from 'react';
import RateLineChart, { SENTIMENT } from '@/components/landing/rate/RateLineChart';
import DashboardCard from './DashboardCard';
import PillTabs from './PillTabs';
import { RATE_SERIES_7D, RATE_SERIES_30D, RATE_SERIES_90D, RATE_SERIES_1Y } from '@/lib/mock/dashboard';

const TIMEFRAMES = [
  { value: '7H', label: '7H' },
  { value: '30H', label: '30H' },
  { value: '90H', label: '90H' },
  { value: '1T', label: '1T' },
] as const;

type Timeframe = (typeof TIMEFRAMES)[number]['value'];

// Peta timeframe -> deret data. Mengganti tab cukup mengganti `data` yang
// dikirim ke RateLineChart; komponen grafiknya sendiri tidak perlu tahu
// apa-apa soal timeframe.
const SERIES_BY_TIMEFRAME: Record<Timeframe, typeof RATE_SERIES_30D> = {
  '7H': RATE_SERIES_7D,
  '30H': RATE_SERIES_30D,
  '90H': RATE_SERIES_90D,
  '1T': RATE_SERIES_1Y,
};

const TIMEFRAME_DESCRIPTIONS: Record<Timeframe, string> = {
  '7H': '7 hari terakhir',
  '30H': '30 hari terakhir',
  '90H': '90 hari terakhir',
  '1T': '1 tahun terakhir',
};

// Legenda diturunkan dari SENTIMENT (sumber tunggal warna+label di
// RateLineChart.tsx) — sama seperti cara RateCard.tsx merender legendanya.
const legend = Object.values(SENTIMENT);

export default function RateChartCard() {
  const [timeframe, setTimeframe] = useState<Timeframe>('30H');

  return (
    <DashboardCard>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Grafik kurs</p>
          <p className="mt-1 font-mono text-sm text-ink">
            USD/IDR · {TIMEFRAME_DESCRIPTIONS[timeframe]}
          </p>
        </div>
        <PillTabs options={TIMEFRAMES} value={timeframe} onChange={setTimeframe} />
      </div>

      <RateLineChart data={SERIES_BY_TIMEFRAME[timeframe]} className="mt-4 h-56" />

      <div className="mt-2 flex gap-4 font-mono text-[11px] text-muted">
        {legend.map((item) => (
          <span key={item.label} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </span>
        ))}
      </div>
    </DashboardCard>
  );
}
