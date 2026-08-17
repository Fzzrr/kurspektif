'use client';

import { useMemo, useState } from 'react';
import NewsSearchBar from './news/NewsSearchBar';
import NewsHeader from './news/NewsHeader';
import NewsFilterBar, { type SentimentFilter } from './news/NewsFilterBar';
import NewsHeadlineCard from './news/NewsHeadlineCard';
import NewsLatestList from './news/NewsLatestList';
import NewsGrid from './news/NewsGrid';
import { CloseIcon } from '@/components/ui/icons';
import { NEWS_ITEMS } from '@/lib/mock/news';

export default function NewsBoard() {
  const [search, setSearch] = useState('');
  const [pair, setPair] = useState('semua');
  const [region, setRegion] = useState('semua');
  const [category, setCategory] = useState('semua');
  const [sentiment, setSentiment] = useState<SentimentFilter>('semua');

  const filteredNews = useMemo(() => {
    const query = search.trim().toLowerCase();
    return NEWS_ITEMS.filter((item) => {
      const matchesSearch =
        query === '' ||
        item.headline.toLowerCase().includes(query) ||
        item.source.toLowerCase().includes(query) ||
        item.pair?.toLowerCase().includes(query);
      // Berita tanpa `pair` (mis. komoditas murni) memang tersaring keluar
      // begitu sebuah pasangan dipilih — itu perilaku yang diharapkan.
      const matchesPair = pair === 'semua' || item.pair === pair;
      const matchesRegion = region === 'semua' || item.region === region;
      const matchesCategory = category === 'semua' || item.category === category;
      const matchesSentiment = sentiment === 'semua' || item.sentiment === sentiment;
      return matchesSearch && matchesPair && matchesRegion && matchesCategory && matchesSentiment;
    });
  }, [search, pair, region, category, sentiment]);

  const activeFilterCount =
    Number(pair !== 'semua') +
    Number(region !== 'semua') +
    Number(category !== 'semua') +
    Number(sentiment !== 'semua');

  // Search sengaja tidak ikut direset — kolomnya terpisah jauh di atas bar ini.
  function resetFilters() {
    setPair('semua');
    setRegion('semua');
    setCategory('semua');
    setSentiment('semua');
  }

  // Headline dipisah dulu, SISANYA dibagi ke "Paling baru" (maks 4) lalu grid —
  // supaya tidak ada berita yang tampil dobel di dua tempat sekaligus. Kalau
  // hasil filter tidak memuat headline, blok atas tidak dirender sama sekali,
  // jadi semua sisa berita harus masuk grid — bukan ikut dipotong 4.
  const headline = filteredNews.find((item) => item.isHeadline);
  const rest = headline ? filteredNews.filter((item) => item.id !== headline.id) : filteredNews;
  const latest = headline ? rest.slice(0, 4) : [];
  const gridItems = headline ? rest.slice(4) : rest;

  return (
    <div className="space-y-6">
      <NewsSearchBar value={search} onChange={setSearch} />

      {/* `items-end` menyejajarkan tombol dengan baris terakhir paragraf header. */}
      <div className="flex items-end justify-between gap-4">
        <NewsHeader />
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={resetFilters}
            className="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-xs text-muted transition-colors hover:bg-paper hover:text-ink"
          >
            <CloseIcon className="size-3.5" />
            Reset {activeFilterCount} filter
          </button>
        )}
      </div>

      <NewsFilterBar
        pair={pair}
        onPairChange={setPair}
        region={region}
        onRegionChange={setRegion}
        category={category}
        onCategoryChange={setCategory}
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