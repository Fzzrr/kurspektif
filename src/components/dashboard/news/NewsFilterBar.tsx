import { SwapIcon } from '@/components/ui/icons';
import PillTabs from '../ui/PillTabs';
import SelectMenu from '../ui/SelectMenu';
import { currencyToFlag } from '../rate/PairSelector';
import type { Currency } from '@/lib/frankfurter';

const SENTIMENT_OPTIONS = [
  { value: 'semua', label: 'Semua sentimen' },
  { value: 'positif', label: 'Positif' },
  { value: 'netral', label: 'Netral' },
  { value: 'negatif', label: 'Negatif' },
] as const;

export type SentimentFilter = (typeof SENTIMENT_OPTIONS)[number]['value'];

type Props = {
  currency: string;
  onCurrencyChange: (value: string) => void;
  currencies: Currency[];
  sentiment: SentimentFilter;
  onSentimentChange: (value: SentimentFilter) => void;
};

// Tombol reset TIDAK di sini — letaknya sejajar paragraf NewsHeader, dirakit
// di NewsBoard yang memang memegang seluruh state filter.
export default function NewsFilterBar({ currency, onCurrencyChange, currencies, sentiment, onSentimentChange }: Props) {
  const currencyOptions = [
    { value: 'semua', label: 'Semua mata uang' },
    ...currencies.map((c) => {
      const flag = currencyToFlag(c.code);
      return { value: c.code, label: `${flag ? `${flag} ` : ''}${c.code} - ${c.name}` };
    }),
  ];

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-3 md:flex-row md:flex-wrap md:items-center">
      <SelectMenu
        options={currencyOptions}
        value={currency}
        onChange={onCurrencyChange}
        active={currency !== 'semua'}
        searchable
        icon={<SwapIcon className={`size-4 ${currency !== 'semua' ? 'text-accent' : 'text-muted'}`} />}
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
