"use client";

import { useEffect, useRef, useState } from 'react';
import { AreaChart, Area, YAxis, Tooltip } from 'recharts';
import type { CurrencyPoint } from '@/types/currency';

// Static mock data for the USD → IDR rate preview (last 30 days).
const MOCK_CHART_DATA: CurrencyPoint[] = [
  { date: '29 May', fullDate: '29 May 2026', rate: 16050 },
  { date: '30 May', fullDate: '30 May 2026', rate: 16092 },
  { date: '31 May', fullDate: '31 May 2026', rate: 16038 },
  { date: '01 Jun', fullDate: '01 Jun 2026', rate: 16135 },
  { date: '02 Jun', fullDate: '02 Jun 2026', rate: 16088 },
  { date: '03 Jun', fullDate: '03 Jun 2026', rate: 16210 },
  { date: '04 Jun', fullDate: '04 Jun 2026', rate: 16168 },
  { date: '05 Jun', fullDate: '05 Jun 2026', rate: 16255 },
  { date: '06 Jun', fullDate: '06 Jun 2026', rate: 16302 },
  { date: '07 Jun', fullDate: '07 Jun 2026', rate: 16224 },
  { date: '08 Jun', fullDate: '08 Jun 2026', rate: 16175 },
  { date: '09 Jun', fullDate: '09 Jun 2026', rate: 16268 },
  { date: '10 Jun', fullDate: '10 Jun 2026', rate: 16341 },
  { date: '11 Jun', fullDate: '11 Jun 2026', rate: 16279 },
  { date: '12 Jun', fullDate: '12 Jun 2026', rate: 16358 },
  { date: '13 Jun', fullDate: '13 Jun 2026', rate: 16295 },
  { date: '14 Jun', fullDate: '14 Jun 2026', rate: 16232 },
  { date: '15 Jun', fullDate: '15 Jun 2026', rate: 16330 },
  { date: '16 Jun', fullDate: '16 Jun 2026', rate: 16402 },
  { date: '17 Jun', fullDate: '17 Jun 2026', rate: 16338 },
  { date: '18 Jun', fullDate: '18 Jun 2026', rate: 16264 },
  { date: '19 Jun', fullDate: '19 Jun 2026', rate: 16210 },
  { date: '20 Jun', fullDate: '20 Jun 2026', rate: 16305 },
  { date: '21 Jun', fullDate: '21 Jun 2026', rate: 16372 },
  { date: '22 Jun', fullDate: '22 Jun 2026', rate: 16308 },
  { date: '23 Jun', fullDate: '23 Jun 2026', rate: 16248 },
  { date: '24 Jun', fullDate: '24 Jun 2026', rate: 16336 },
  { date: '25 Jun', fullDate: '25 Jun 2026', rate: 16408 },
  { date: '26 Jun', fullDate: '26 Jun 2026', rate: 16352 },
  { date: 'Today', fullDate: '27 Jun 2026', rate: 16421 },
];

export default function LiveCurrencyChart() {
  // Ukur container sendiri dengan ResizeObserver, lalu beri AreaChart ukuran
  // piksel konkret. Kita sengaja tidak memakai ResponsiveContainer karena ia
  // melaporkan warning width(-1)/height(-1) saat panel masih `display:none`
  // (mis. di bawah breakpoint lg) atau pada render pertama internalnya.
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const chartData = MOCK_CHART_DATA;
  const firstRate = chartData[0].rate;
  const lastRate = chartData[chartData.length - 1].rate;

  const currentRate = new Intl.NumberFormat('en-US').format(lastRate);
  const diff = lastRate - firstRate;
  const diffPercent = ((diff / firstRate) * 100).toFixed(2);
  const isUp = diff >= 0;

  const ratesArray = chartData.map(d => d.rate);
  const minRate = Math.min(...ratesArray) - 30;
  const maxRate = Math.max(...ratesArray) + 30;

  const lineColor = isUp ? 'var(--color-up)' : 'var(--color-down)';

  return (
    <div className="mt-6 rounded-2xl border border-line bg-surface p-5 text-ink shadow-[0_30px_70px_-30px_rgba(0,0,0,0.7)]">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted">USD → IDR</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-paper px-2 py-0.5 font-mono text-[10px] tracking-wide text-muted">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-up opacity-75"></span>
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-up"></span>
          </span>
          LIVE
        </span>
      </div>

      <div className="mt-2 flex items-end justify-between">
        <p className="font-mono text-4xl font-semibold tracking-tight">{currentRate}</p>
        <span
          className="mb-1 inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-xs font-semibold"
          style={{
            color: lineColor,
            backgroundColor: isUp ? 'rgba(47,143,91,0.12)' : 'rgba(192,73,47,0.12)',
          }}
        >
          {isUp ? '▲' : '▼'} {isUp ? '+' : ''}{diffPercent}%
        </span>
      </div>

      <div ref={wrapRef} className="mt-4 h-28 w-full overflow-x-clip">
        {size.width > 0 && size.height > 0 && (
          <AreaChart
            width={size.width}
            height={size.height}
            data={chartData}
            margin={{ top: 5, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity={0.28} />
                <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>

            <YAxis domain={[minRate, maxRate]} hide />

            <Tooltip
              cursor={{ stroke: 'var(--color-line)', strokeWidth: 1 }}
              contentStyle={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-line)',
                borderRadius: '10px',
                fontSize: '11px',
                fontFamily: 'monospace',
                color: 'var(--color-ink)',
                boxShadow: '0 10px 30px -12px rgba(0,0,0,0.35)',
              }}
              labelFormatter={(label, items) => items[0]?.payload.fullDate || label}
              formatter={(value) => [`Rp ${new Intl.NumberFormat('en-US').format(Number(value))}`, 'Rate']}
            />

            <Area
              type="linear"
              dataKey="rate"
              stroke={lineColor}
              strokeWidth={2.4}
              fill="url(#rateGradient)"
              dot={false}
              activeDot={{ r: 5, fill: lineColor, stroke: 'var(--color-surface)', strokeWidth: 2 }}
            />
          </AreaChart>
        )}
      </div>

      <div className="mt-2 flex justify-between font-mono text-[9px] text-muted">
        <span>{chartData[0].date}</span>
        <span>{chartData[chartData.length - 1].date}</span>
      </div>

      <div className="mt-4 rounded-lg bg-accent-soft px-4 py-3 text-xs leading-relaxed text-ink">
        <span className="font-semibold text-accent">✦ This week:</span> The exchange rate {isUp ? 'strengthened' : 'weakened'} {isUp ? '+' : ''}{diffPercent}% over the last 30 days.
      </div>
    </div>
  );
}
