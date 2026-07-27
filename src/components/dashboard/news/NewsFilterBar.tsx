'use client';

import { SearchIcon, FilterIcon, GlobeIcon } from '@/components/ui/icons';
import PillTabs from '../ui/PillTabs';
import { REGIONS, CATEGORIES } from '@/lib/mock/news';

const SENTIMENT_OPTIONS = [
  { value: 'semua', label: 'Semua sentimen' },
  { value: 'positif', label: 'Positif' },
  { value: 'netral', label: 'Netral' },
  { value: 'negatif', label: 'Negatif' },
] as const;

export type SentimentFilter = (typeof SENTIMENT_OPTIONS)[number]['value'];

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  region: string;
  onRegionChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  sentiment: SentimentFilter;
  onSentimentChange: (value: SentimentFilter) => void;
};

export default function NewsFilterBar({
  search,
  onSearchChange,
  region,
  onRegionChange,
  category,
  onCategoryChange,
  sentiment,
  onSentimentChange,
}: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-3 md:flex-row md:items-center">
      <label className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-line px-3 py-2">
        <SearchIcon className="size-4 shrink-0 text-muted" />
        <input
          type="text"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Cari berita, sumber, atau pasangan mata uang..."
          className="w-full bg-transparent font-mono text-sm text-ink outline-none placeholder:text-muted/60"
        />
      </label>

      <button
        type="button"
        className="flex shrink-0 items-center gap-2 rounded-full border border-line px-3 py-2 font-mono text-xs uppercase tracking-wide text-muted transition-colors hover:bg-paper hover:text-ink"
      >
        <FilterIcon className="size-4" />
        Filter
      </button>

      <label className="flex shrink-0 items-center gap-2 rounded-full border border-line px-3 py-2">
        <GlobeIcon className="size-4 text-muted" />
        <select
          value={region}
          onChange={(event) => onRegionChange(event.target.value)}
          className="bg-transparent font-mono text-sm text-ink outline-none"
        >
          <option value="semua">Semua wilayah</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </label>

      <label className="flex shrink-0 items-center gap-2 rounded-full border border-line px-3 py-2">
        <select
          value={category}
          onChange={(event) => onCategoryChange(event.target.value)}
          className="bg-transparent font-mono text-sm text-ink outline-none"
        >
          <option value="semua">Semua kategori</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>

      <PillTabs options={SENTIMENT_OPTIONS} value={sentiment} onChange={onSentimentChange} className="shrink-0" />
    </div>
  );
}