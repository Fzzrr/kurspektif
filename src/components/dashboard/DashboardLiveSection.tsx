'use client';

import { useEffect, useMemo, useState } from 'react';
import DashboardHeader from './layout/DashboardHeader';
import PairSelector from './rate/PairSelector';
import StatCardsRow from './rate/StatCardsRow';
import RateChartCard from './rate/RateChartCard';
import { useLiveRate } from '@/lib/useLiveRate';
import { formatRate } from '@/components/landing/rate/RateLineChart';
import type { Currency } from '@/lib/frankfurter';

const fmt = (value: number, opts?: Intl.NumberFormatOptions) => new Intl.NumberFormat('id-ID', opts).format(value);
const dateFmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

const RECENT_PAIRS_KEY = 'kurspektif:recentPairs';
const DEFAULT_RECENT_PAIRS = ['USD/IDR', 'EUR/IDR', 'JPY/IDR', 'SGD/IDR', 'USD/EUR'];
const MAX_RECENT_PAIRS = 5;

type Props = { title: string; currencies: Currency[] };

export default function DashboardLiveSection({ title, currencies }: Props) {
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('IDR');

  const [recentPairs, setRecentPairs] = useState<string[]>(DEFAULT_RECENT_PAIRS);

  // Sesaat setelah mount: baca riwayat tersimpan, lalu pulihkan pasangan
  // PALING BARU (recentPairs[0]) sebagai pasangan yang aktif sekarang.
  // Harus di useEffect, bukan di initializer useState — localStorage tidak
  // ada saat komponen ini pertama kali dirender di server.
  useEffect(() => {
    const saved = localStorage.getItem(RECENT_PAIRS_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed.every((p) => typeof p === 'string')) {
        setRecentPairs(parsed);
        const [savedFrom, savedTo] = parsed[0].split('/');
        if (savedFrom) setFrom(savedFrom);
        if (savedTo) setTo(savedTo);
      }
    } catch {
      // data tersimpan rusak/format lama -> abaikan, pakai default
    }
  }, []);

  // Tiap kali pasangan berubah: taruh di depan riwayat, buang duplikat,
  // batasi 5, lalu simpan ulang ke localStorage.
  useEffect(() => {
    const current = `${from}/${to}`;
    setRecentPairs((prevList) => {
      const updated = [current, ...prevList.filter((pair) => pair !== current)].slice(0, MAX_RECENT_PAIRS);
      localStorage.setItem(RECENT_PAIRS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [from, to]);

  const { latest, series, isLoading, error } = useLiveRate(from, to, 365);

  const updatedAt = latest ? `${dateFmt.format(new Date(latest.date))} (kurs referensi harian)` : 'Memuat…';

  const change = useMemo(() => {
    if (!latest || series.length < 2) return { changeAbsolute: '—', changePercent: 'Memuat…', changeDir: null };
    const prev = series[series.length - 2].rate;
    const diff = latest.rate - prev;
    return {
      changeAbsolute: formatRate(Math.abs(diff)),
      changePercent: `${fmt(Math.abs((diff / prev) * 100), { maximumFractionDigits: 3 })}%`,
      changeDir: diff >= 0 ? ('up' as const) : ('down' as const),
    };
  }, [latest, series]);

  const historicalPosition = useMemo(() => {
    const window = series.slice(-90);
    if (!latest || window.length < 2) return { label: 'Memuat…', min: '-', max: '-', percentile: 50 };
    const rates = window.map((p) => p.rate);
    const min = Math.min(...rates);
    const max = Math.max(...rates);
    const percentile = Math.round((rates.filter((r) => r < latest.rate).length / rates.length) * 100);
    return { label: `Lebih tinggi dari ${percentile}% hari (${window.length} hari terakhir)`, min: formatRate(min), max: formatRate(max), percentile };
  }, [latest, series]);

  return (
    <>
      <DashboardHeader title={title} updatedAt={updatedAt} />
      <PairSelector
        from={from}
        to={to}
        currencies={currencies}
        recentPairs={recentPairs}
        onChange={(next) => {
          setFrom(next.from);
          setTo(next.to);
        }}
      />
      {error && (
        <p className="rounded-lg border border-down/30 bg-down/5 px-4 py-2 font-mono text-xs text-down">{error}</p>
      )}
      <StatCardsRow
        currentRate={{ rate: latest ? formatRate(latest.rate) : '—', ...change }}
        quickConvert={{ rate: latest?.rate ?? 0, fromCode: from, toCode: to }}
        historicalPosition={historicalPosition}
      />
      <RateChartCard series={series} pair={`${from}/${to}`} isLoading={isLoading && series.length === 0} />
    </>
  );
}