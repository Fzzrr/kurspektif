'use client';

import { useState } from 'react';
import { SearchIcon } from '@/components/ui/icons';
import SentimentFilter, { type SentimentFilterValue } from './news/SentimentFilter';
import CurrencyFilter from './news/CurrencyFilter';
import NewsDay from './news/NewsDay';
import type { NewsItem } from '@/lib/marketaux';
import type { Currency } from '@/lib/frankfurter';
import { dayKey, formatTimeAgo } from '@/lib/timeAgo';

const PAGE_SIZE = 30;

type Props = { items: NewsItem[]; currencies: Currency[]; initialCurrency?: string };

const codesOf = (item: NewsItem) => item.pair?.split('/') ?? [];

export default function NewsBoard({ items, currencies, initialCurrency }: Props) {
  const [search, setSearch] = useState('');
  // Filter awal dari URL (?currency=USD, dikirim tombol "Lihat semua" di
  // dashboard) hanya dipakai kalau memang ada beritanya.
  const [currency, setCurrency] = useState(() =>
    initialCurrency && items.some((item) => codesOf(item).includes(initialCurrency)) ? initialCurrency : 'semua',
  );
  const [sentiment, setSentiment] = useState<SentimentFilterValue>('semua');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Setiap perubahan filter mulai lagi dari halaman pertama.
  function updateSearch(value: string) {
    setSearch(value);
    setVisibleCount(PAGE_SIZE);
  }
  function updateCurrency(value: string) {
    setCurrency(value);
    setVisibleCount(PAGE_SIZE);
  }
  function updateSentiment(value: SentimentFilterValue) {
    setSentiment(value);
    setVisibleCount(PAGE_SIZE);
  }
  function resetFilters() {
    updateSearch('');
    setCurrency('semua');
    setSentiment('semua');
  }

  const query = search.trim().toLowerCase();
  const matchesSearch = (item: NewsItem) =>
    query === '' ||
    item.headline.toLowerCase().includes(query) ||
    item.source.toLowerCase().includes(query) ||
    Boolean(item.pair?.toLowerCase().includes(query));
  const matchesCurrency = (item: NewsItem) => currency === 'semua' || codesOf(item).includes(currency);
  const matchesSentiment = (item: NewsItem) => sentiment === 'semua' || item.sentiment === sentiment;

  // Hitungan tiap filter mengikuti filter lainnya: angka sentimen dihitung dari
  // berita yang lolos cari + mata uang, angka mata uang dari cari + sentimen —
  // jadi angka yang tertera selalu sama dengan hasil kalau diklik.
  const forSentiment = items.filter((item) => matchesSearch(item) && matchesCurrency(item));
  const forCurrency = items.filter((item) => matchesSearch(item) && matchesSentiment(item));
  const filtered = forSentiment.filter(matchesSentiment);

  const counts = new Map<string, number>();
  for (const item of forCurrency) {
    for (const code of codesOf(item)) counts.set(code, (counts.get(code) ?? 0) + 1);
  }
  const currencyCounts = currencies
    .filter((c) => counts.has(c.code))
    .map((c) => ({ ...c, count: counts.get(c.code)! }))
    .sort((a, b) => b.count - a.count);

  // Total per hari dari seluruh hasil filter (bukan yang sudah tampil), supaya
  // judul hari tidak berubah saat "Tampilkan lagi" ditekan. Items sudah urut
  // terbaru, jadi Map menjaga urutan harinya.
  const byDay = new Map<string, NewsItem[]>();
  for (const item of filtered) {
    const key = dayKey(item.publishedAt);
    byDay.set(key, [...(byDay.get(key) ?? []), item]);
  }
  const days = Array.from(byDay);

  const visibleIds = new Set(filtered.slice(0, visibleCount).map((item) => item.id));
  const remaining = Math.max(0, filtered.length - visibleCount);
  const isFiltered = query !== '' || currency !== 'semua' || sentiment !== 'semua';
  const sourceCount = new Set(items.map((item) => item.source)).size;

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-[34px] font-semibold leading-tight tracking-[-0.02em]">Berita</h1>
          <p className="mt-2 text-[15px] text-muted">
            {items.length > 0
              ? `${items.length} berita kurs dan ekonomi dari ${sourceCount} sumber, terbaru ${formatTimeAgo(items[0].publishedAt).toLowerCase()}.`
              : 'Belum ada berita di arsip.'}
          </p>
        </div>

        <label className="flex h-10 w-full items-center gap-2.5 bg-surface px-3.5 focus-within:ring-2 focus-within:ring-accent/40 lg:w-80 xl:w-[300px]">
          <SearchIcon className="size-4 shrink-0 text-muted" />
          <span className="sr-only">Cari berita</span>
          <input
            type="search"
            value={search}
            onChange={(event) => updateSearch(event.target.value)}
            placeholder="Cari judul, sumber, atau pasangan"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
          />
        </label>
      </header>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px] xl:gap-10">
        {/* Di layar lebar jadi kolom kanan yang ikut menempel saat digulir; di
            layar kecil tampil ringkas di atas daftar berita. */}
        <aside className="min-w-0 space-y-4 xl:sticky xl:top-10 xl:col-start-2 xl:row-start-1 xl:self-start">
          <SentimentFilter items={forSentiment} value={sentiment} onChange={updateSentiment} />
          <CurrencyFilter currencies={currencyCounts} value={currency} onChange={updateCurrency} />
        </aside>

        <div className="min-w-0 xl:col-start-1 xl:row-start-1">
          {isFiltered && (
            <p className="mb-6 flex flex-wrap items-baseline gap-x-3 text-sm text-muted">
              <span>
                Menampilkan <span className="font-mono text-ink">{filtered.length}</span> dari{' '}
                <span className="font-mono">{items.length}</span> berita
              </span>
              <button type="button" onClick={resetFilters} className="text-ink underline underline-offset-4 hover:text-muted">
                Atur ulang filter
              </button>
            </p>
          )}

          {filtered.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line px-4 py-12 text-center text-sm text-muted">
              Tidak ada berita yang cocok. Coba kata kunci lain atau atur ulang filter.
            </p>
          ) : (
            <div className="space-y-12">
              {days.map(([key, dayItems], index) => {
                const shown = dayItems.filter((item) => visibleIds.has(item.id));
                if (shown.length === 0) return null;
                return <NewsDay key={key} dayKey={key} items={dayItems} shown={shown} withLead={index === 0} />;
              })}

              {remaining > 0 && (
                <button
                  type="button"
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                  className="h-11 w-full bg-surface text-sm text-ink hover:bg-accent-soft"
                >
                  Tampilkan {Math.min(PAGE_SIZE, remaining)} berita lagi
                  <span className="text-muted"> · sisa {remaining}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
