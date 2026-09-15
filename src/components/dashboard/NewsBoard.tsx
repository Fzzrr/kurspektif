'use client';

import { useMemo, useState } from 'react';
import NewsSearchBar from './news/NewsSearchBar';
import NewsHeader from './news/NewsHeader';
import NewsFilterBar, { type SentimentFilter } from './news/NewsFilterBar';
import NewsHeadlineCard from './news/NewsHeadlineCard';
import NewsLatestList from './news/NewsLatestList';
import NewsGrid from './news/NewsGrid';
import type { NewsItem } from '@/lib/marketaux';
import type { Currency } from '@/lib/frankfurter';

type Props = { items: NewsItem[]; currencies: Currency[]; initialCurrency?: string };

export default function NewsBoard({ items, currencies, initialCurrency }: Props) {
  const [search, setSearch] = useState('');
  // Filter awal dari URL (?currency=USD, dikirim tombol "Lihat semua" di
  // dashboard) hanya dipakai kalau memang ada beritanya — kalau tidak,
  // dropdown akan menampilkan pilihan yang tidak ada di daftarnya.
  const [currency, setCurrency] = useState(() =>
    initialCurrency && items.some((item) => item.pair?.split('/').includes(initialCurrency))
      ? initialCurrency
      : 'semua',
  );
  const [sentiment, setSentiment] = useState<SentimentFilter>('semua');

  // Dropdown hanya menawarkan mata uang yang benar-benar muncul di salah satu
  // pasangan berita — memilih salah satunya dijamin ada hasilnya.
  const currencyOptions = useMemo(() => {
    const codesInNews = new Set(items.flatMap((item) => item.pair?.split('/') ?? []));
    return currencies.filter((c) => codesInNews.has(c.code));
  }, [items, currencies]);

  const filteredNews = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch =
        query === '' ||
        item.headline.toLowerCase().includes(query) ||
        item.source.toLowerCase().includes(query) ||
        item.pair?.toLowerCase().includes(query);
      const matchesCurrency = currency === 'semua' || item.pair?.split('/').includes(currency);
      const matchesSentiment = sentiment === 'semua' || item.sentiment === sentiment;
      return matchesSearch && matchesCurrency && matchesSentiment;
    });
  }, [items, search, currency, sentiment]);

  // Kepentingan berita murni dari kebaruan — item pertama (paling baru) jadi
  // headline, tanpa flag manual. Sisanya dibagi ke "Paling baru" (maks 4)
  // lalu grid, supaya tidak ada berita yang tampil dobel di dua tempat.
  const headline = filteredNews[0];
  const rest = filteredNews.slice(1);
  const latest = headline ? rest.slice(0, 4) : [];
  const gridItems = headline ? rest.slice(4) : rest;

  return (
    <div className="space-y-6">
      <NewsSearchBar value={search} onChange={setSearch} />

      <NewsHeader />

      <NewsFilterBar
        currency={currency}
        onCurrencyChange={setCurrency}
        currencies={currencyOptions}
        sentiment={sentiment}
        onSentimentChange={setSentiment}
      />

      {headline && (
        <div className="grid gap-4 md:grid-cols-[3fr_2fr]">
          <NewsHeadlineCard item={headline} />
          <NewsLatestList items={latest} />
        </div>
      )}

      <NewsGrid items={gridItems} totalCount={filteredNews.length} />
    </div>
  );
}