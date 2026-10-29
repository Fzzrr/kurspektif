'use client';

import { useState } from 'react';
import DashboardHeader from './layout/DashboardHeader';
import PairSelector from './rate/PairSelector';
import StatCardsRow from './rate/StatCardsRow';
import RateChartCard from './rate/RateChartCard';
import MarketMoversCard from './rate/MarketMoversCard';
import NewsListCard from './news/NewsListCard';
import { useLiveRate } from '@/lib/useLiveRate';
import { toggleWatchAction } from '@/app/dashboard/watchlist-actions';
import { byRelevance } from '@/lib/pairs';
import { dailyChange, formatRate, historicalPosition as positionOf } from '@/lib/rateStats';
import type { Currency } from '@/lib/frankfurter';
import type { NewsItem } from '@/lib/marketaux';

const dateFmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

// Pintasan untuk pengguna yang belum menyimpan pasangan apa pun.
const SUGGESTED_PAIRS = ['USD/IDR', 'EUR/IDR', 'JPY/IDR', 'SGD/IDR'];

type Props = {
  title: string;
  currencies: Currency[];
  news: NewsItem[];
  initialWatchlist: string[];
  /** "USD/IDR" — dibuka dari tautan; kalau kosong, pasangan tersimpan pertama. */
  initialPair?: string;
};

export default function DashboardLiveSection({ title, currencies, news, initialWatchlist, initialPair }: Props) {
  const [initialFrom, initialTo] = (initialPair ?? initialWatchlist[0] ?? 'USD/IDR').split('/');
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [watchlist, setWatchlist] = useState(initialWatchlist);
  const [watchError, setWatchError] = useState<string | null>(null);
  const activePair = `${from}/${to}`;

  function updatePair(next: { from: string; to: string }) {
    setFrom(next.from);
    setTo(next.to);
    setWatchError(null);
  }

  // Optimistis: tombol langsung berubah, dikembalikan kalau server menolak.
  function toggleWatch() {
    const previous = watchlist;
    setWatchlist(previous.includes(activePair) ? previous.filter((p) => p !== activePair) : [...previous, activePair]);
    setWatchError(null);
    toggleWatchAction(from, to).then((result) => {
      if ('error' in result) {
        setWatchlist(previous);
        setWatchError(result.error);
      } else {
        setWatchlist(result.pairs);
      }
    });
  }

  const { latest, series, isLoading, error } = useLiveRate(from, to, 365);

  // Jujur soal sumbernya: kurs referensi bank sentral, terbit sekali per hari
  // kerja — bukan kurs real-time atau kurs jual/beli bank.
  const updatedAt = latest ? `Kurs referensi harian · ${dateFmt.format(new Date(latest.date))}` : 'Memuat…';

  const change = dailyChange(series, latest);

  // Berita yang pasangannya memuat salah satu sisi pasangan aktif — sama
  // seperti filter mata uang di halaman berita.
  const isRelated = (item: NewsItem) => item.pair?.split('/').some((code) => code === from || code === to) ?? false;
  const relatedNews = byRelevance(news.filter(isRelated), (item) => item.pair, [from, to]);
  const otherNews = news.filter((item) => !isRelated(item));

  const historicalPosition = positionOf(series, latest);

  return (
    <>
      <DashboardHeader title={title} updatedAt={updatedAt} />
      <PairSelector
        from={from}
        to={to}
        currencies={currencies}
        quickPairs={watchlist.length > 0 ? watchlist : SUGGESTED_PAIRS}
        saved={watchlist.includes(activePair)}
        onToggleSave={toggleWatch}
        onChange={updatePair}
      />
      {watchError && <p className="font-mono text-xs text-down">{watchError}</p>}
      {error && (
        <p className="rounded-lg border border-down/30 bg-down/5 px-4 py-2 font-mono text-xs text-down">{error}</p>
      )}
      <StatCardsRow
        currentRate={{
          rate: latest ? formatRate(latest.rate) : '—',
          ...change,
          pair: activePair,
          sparkline: series.slice(-30).map((p) => p.rate),
        }}
        quickConvert={{ rate: latest?.rate ?? 0, fromCode: from, toCode: to }}
        historicalPosition={historicalPosition}
      />
      <RateChartCard series={series} pair={activePair} isLoading={isLoading && series.length === 0} />

      {/* 3fr/2fr ~= proporsi 60/40 dari desain — kartu movers lebih lebar
          dari kartu daftar berita. */}
      <div className="grid gap-4 md:grid-cols-[3fr_2fr]">
        <MarketMoversCard news={relatedNews} pair={activePair} />
        <NewsListCard related={relatedNews} others={otherNews} currency={from} />
      </div>
    </>
  );
}