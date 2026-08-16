import { GlobeIcon, SwapIcon } from '@/components/ui/icons';
import PillTabs from '../ui/PillTabs';
import { REGIONS, CATEGORIES, NEWS_PAIRS } from '@/lib/mock/news';
import SelectMenu from '../ui/SelectMenu';

const SENTIMENT_OPTIONS = [
  { value: 'semua', label: 'Semua sentimen' },
  { value: 'positif', label: 'Positif' },
  { value: 'netral', label: 'Netral' },
  { value: 'negatif', label: 'Negatif' },
] as const;

export type SentimentFilter = (typeof SENTIMENT_OPTIONS)[number]['value'];

// Opsi "semua" selalu paling depan supaya urutan resetnya konsisten di ketiga
// menu. Sengaja bertipe string biasa agar cocok dengan state filter NewsBoard.
type FilterOption = { value: string; label: string };

const PAIR_OPTIONS: FilterOption[] = [
  { value: 'semua', label: 'Semua pasangan' },
  ...NEWS_PAIRS.map((pair) => ({ value: pair, label: pair })),
];

const REGION_OPTIONS: FilterOption[] = [
  { value: 'semua', label: 'Semua wilayah' },
  ...REGIONS.map((region) => ({ value: region, label: region })),
];

const CATEGORY_OPTIONS: FilterOption[] = [
  { value: 'semua', label: 'Semua kategori' },
  ...CATEGORIES.map((category) => ({ value: category, label: category })),
];

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
      <SelectMenu
        options={PAIR_OPTIONS}
        value={pair}
        onChange={onPairChange}
        active={pair !== 'semua'}
        icon={<SwapIcon className={`size-4 ${pair !== 'semua' ? 'text-accent' : 'text-muted'}`} />}
      />

      <SelectMenu
        options={REGION_OPTIONS}
        value={region}
        onChange={onRegionChange}
        active={region !== 'semua'}
        icon={<GlobeIcon className={`size-4 ${region !== 'semua' ? 'text-accent' : 'text-muted'}`} />}
      />

      <SelectMenu
        options={CATEGORY_OPTIONS}
        value={category}
        onChange={onCategoryChange}
        active={category !== 'semua'}
      />

      <PillTabs
        options={SENTIMENT_OPTIONS}
        value={sentiment}
        onChange={onSentimentChange}
        className="shrink-0 md:ml-auto"
      />
    </div>
  );
}
