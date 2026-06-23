"use client";

import { useState, useEffect } from 'react';
import { LineChart, Line, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { CurrencyPoint } from '@/types/currency';

export default function LiveCurrencyChart() {
  const [currentRate, setCurrentRate] = useState('...');
  const [chartData, setChartData] = useState<CurrencyPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocalData = async () => {
      try {
        setLoading(true);
        
        // Memanggil API Route lokal milik Next.js kita sendiri
        const response = await fetch('/api/currency');
        
        if (!response.ok) {
          throw new Error('Gagal memuat data dari server lokal');
        }
        
        const formattedData = await response.json();

        if (formattedData.error) {
          throw new Error(formattedData.error);
        }

        setChartData(formattedData);

        // Set kurs terakhir
        if (formattedData.length > 0) {
          const latestRate = formattedData[formattedData.length - 1].rate;
          setCurrentRate(new Intl.NumberFormat('id-ID').format(latestRate));
        }
        setError(null);
        
      } catch (err) {
        console.error("Client Fetch Error:", err);
        setError("Gagal memuat data live.");
        
        // Fallback data simulasi jika server lokal terputus
        setChartData([
          { date: 'H-28', fullDate: 'Simulasi', rate: 16180 },
          { date: 'H-21', fullDate: 'Simulasi', rate: 16210 },
          { date: 'H-14', fullDate: 'Simulasi', rate: 16190 },
          { date: 'H-7', fullDate: 'Simulasi', rate: 16234 },
          { date: 'Hari Ini', fullDate: 'Simulasi', rate: 16250 },
        ]);
        setCurrentRate('16.250');
      } finally {
        setLoading(false);
      }
    };

    fetchLocalData();
  }, []);

  const ratesArray = chartData.map(d => d.rate);
  const minRate = ratesArray.length > 0 ? Math.min(...ratesArray) - 50 : 0;
  const maxRate = ratesArray.length > 0 ? Math.max(...ratesArray) + 50 : 0;

  return (
    <div className="mt-6 rounded-2xl border border-line bg-surface p-5 text-ink shadow-[0_30px_70px_-30px_rgba(0,0,0,0.7)]">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted">USD → IDR</span>
        <span className="rounded bg-paper px-2 py-0.5 font-mono text-[10px] tracking-wide text-muted">
          LIVE
        </span>
      </div>

      <p className="mt-2 flex items-center gap-3 font-mono text-4xl font-semibold tracking-tight">
        {loading ? '...' : currentRate}
        {error && <span className="text-xs text-red-500 font-sans font-normal">Mode Simulasi</span>}
      </p>

      <div className="mt-4 h-24 w-full relative">
        <div className="absolute top-[22px] w-full border-t border-line z-0"></div>

        {loading ? (
          <div className="flex h-full items-center justify-center text-xs text-muted font-mono">Sinkronisasi data pasar...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" className="z-10 relative">
            <LineChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
              <YAxis domain={[minRate, maxRate]} hide />
              
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace', color: 'var(--color-ink)' }}
                labelFormatter={(label, items) => items[0]?.payload.fullDate || label}
                formatter={(value) => [`Rp ${new Intl.NumberFormat('id-ID').format(Number(value))}`, 'Kurs']}
              />
              
              <Line
                type="monotone"
                dataKey="rate"
                stroke="var(--color-ink)"
                strokeWidth={2.4}
                dot={false}
                activeDot={{ r: 5, fill: 'var(--color-ink)', stroke: 'var(--color-surface)', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {!loading && chartData.length > 0 && (
        <div className="mt-1 flex justify-between font-mono text-[9px] text-muted">
          <span>{chartData[0].date}</span>
          <span>{chartData[chartData.length - 1].date}</span>
        </div>
      )}

      <div className="mt-4 rounded-lg bg-accent-soft px-4 py-3 text-xs leading-relaxed text-ink">
        <span className="font-semibold text-accent">✦ Pekan ini:</span> Data pergerakan nilai tukar ditarik melalui gerbang aman server untuk stabilitas performa.
      </div>
    </div>
  );
}