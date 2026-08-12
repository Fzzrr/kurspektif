import { GlobeIcon, SwapIcon } from '@/components/ui/icons';
import PillTabs from '../ui/PillTabs';
import { REGIONS, CATEGORIES, NEWS_PAIRS } from '@/lib/mock/news';

const SENTIMENT_OPTIONS = [
  { value: 'semua', label: 'Semua sentimen' },
  { value: 'positif', label: 'Positif' },
  { value: 'netral', label: 'Netral' },
  { value: 'negatif', label: 'Negatif' },
] as const;

export type SentimentFilter = (typeof SENTIMENT_OPTIONS)[number]['value'];

// Kontrol yang nilainya bukan "semua" diberi aksen — sekali lihat langsung
// ketahuan filter mana yang sedang menyala.
const controlClass = (active: boolean) =>
  `flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 transition-colors ${
    active ? 'border-accent bg-accent-soft/60' : 'border-line hover:bg-paper'
  }`;

const selectClass = 'cursor-pointer bg-transparent font-mono text-sm text-ink outline-none';

type Props = {
  pair: string;
  onPairChange: (value: string) => void;
  region: string;
  onRegionChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  sentiment: SentimentFilter;
  onSentimentChange: (value: SentimentFilter) => void;
};

// Tombol reset TIDAK di sini — letaknya sejajar paragraf NewsHeader, dirakit
// di NewsBoard yang memang memegang seluruh state filter.
export default function NewsFilterBar({
  pair,
  onPairChange,
  region,
  onRegionChange,
  category,
  onCategoryChange,
  sentiment,
  onSentimentChange,
}: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-3 md:flex-row md:flex-wrap md:items-center">
      <label className={controlClass(pair !== 'semua')}>
        <SwapIcon className={`size-4 ${pair !== 'semua' ? 'text-accent' : 'text-muted'}`} />
        <select value={pair} onChange={(event) => onPairChange(event.target.value)} className={selectClass}>
          <option value="semua">Semua pasangan</option>
          {NEWS_PAIRS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </label>

      <label className={controlClass(region !== 'semua')}>
        <GlobeIcon className={`size-4 ${region !== 'semua' ? 'text-accent' : 'text-muted'}`} />
        <select value={region} onChange={(event) => onRegionChange(event.target.value)} className={selectClass}>
          <option value="semua">Semua wilayah</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </label>

      <label className={controlClass(category !== 'semua')}>
        <select value={category} onChange={(event) => onCategoryChange(event.target.value)} className={selectClass}>
          <option value="semua">Semua kategori</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>

      <PillTabs
        options={SENTIMENT_OPTIONS}
        value={sentiment}
        onChange={onSentimentChange}
        className="shrink-0 md:ml-auto"
      />
    </div>
  );
}
