'use client';

import { useMemo, useState } from 'react';
import NewsHeader from './news/NewsHeader';
import NewsFilterBar, { type SentimentFilter } from './news/NewsFilterBar';
import NewsHeadlineCard from './news/NewsHeadlineCard';
import NewsLatestList from './news/NewsLatestList';
import NewsGrid from './news/NewsGrid';
import { NEWS_ITEMS } from '@/lib/mock/news';

export default function NewsBoard() {
  const [search, setSearch] = useState('');
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
      const matchesRegion = region === 'semua' || item.region === region;
      const matchesCategory = category === 'semua' || item.category === category;
      const matchesSentiment = sentiment === 'semua' || item.sentiment === sentiment;
      return matchesSearch && matchesRegion && matchesCategory && matchesSentiment;
    });
  }, [search, region, category, sentiment]);

  // Headline dipisah dulu, SISANYA dibagi ke "Paling baru" (maks 4) lalu grid —
  // supaya tidak ada berita yang tampil dobel di dua tempat sekaligus.
  const headline = filteredNews.find((item) => item.isHeadline);
  const rest = filteredNews.filter((item) => item.id !== headline?.id);
  const latest = rest.slice(0, 4);
  const gridItems = rest.slice(4);

  return (
    <div className="space-y-6">
      <NewsHeader />
      <NewsFilterBar
        search={search}
        onSearchChange={setSearch}
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