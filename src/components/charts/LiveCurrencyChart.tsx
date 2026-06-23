"use client";

import { useEffect, useState } from 'react';
import { AreaChart, Area, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { CurrencyPoint } from '@/types/currency';

// Data mock statis untuk pratinjau grafik kurs USD → IDR (30 hari terakhir).
const MOCK_CHART_DATA: CurrencyPoint[] = [
  { date: '26 Mei', fullDate: '26 Mei 2026', rate: 16180 },
  { date: '29 Mei', fullDate: '29 Mei 2026', rate: 16165 },
  { date: '02 Jun', fullDate: '02 Jun 2026', rate: 16210 },
  { date: '06 Jun', fullDate: '06 Jun 2026', rate: 16195 },
  { date: '10 Jun', fullDate: '10 Jun 2026', rate: 16240 },
  { date: '14 Jun', fullDate: '14 Jun 2026', rate: 16225 },
  { date: '18 Jun', fullDate: '18 Jun 2026', rate: 16268 },
  { date: '21 Jun', fullDate: '21 Jun 2026', rate: 16242 },
  { date: 'Hari Ini', fullDate: '23 Jun 2026', rate: 16290 },
];

export default function LiveCurrencyChart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const chartData = MOCK_CHART_DATA;
  const firstRate = chartData[0].rate;
  const lastRate = chartData[chartData.length - 1].rate;

  const currentRate = new Intl.NumberFormat('id-ID').format(lastRate);
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

      <div className="mt-4 h-28 w-full">
        {mounted && (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
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
              formatter={(value) => [`Rp ${new Intl.NumberFormat('id-ID').format(Number(value))}`, 'Kurs']}
            />

            <Area
              type="monotone"
              dataKey="rate"
              stroke={lineColor}
              strokeWidth={2.4}
              fill="url(#rateGradient)"
              dot={false}
              activeDot={{ r: 5, fill: lineColor, stroke: 'var(--color-surface)', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
        )}
      </div>

      <div className="mt-2 flex justify-between font-mono text-[9px] text-muted">
        <span>{chartData[0].date}</span>
        <span>{chartData[chartData.length - 1].date}</span>
      </div>

      <div className="mt-4 rounded-lg bg-accent-soft px-4 py-3 text-xs leading-relaxed text-ink">
        <span className="font-semibold text-accent">✦ Pekan ini:</span> Nilai tukar bergerak {isUp ? 'menguat' : 'melemah'} {isUp ? '+' : ''}{diffPercent}% dalam 30 hari terakhir.
      </div>
    </div>
  );
}
