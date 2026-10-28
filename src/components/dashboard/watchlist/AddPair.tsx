'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { SwapIcon } from '@/components/ui/icons';
import SelectMenu from '../ui/SelectMenu';
import { toggleWatchAction } from '@/app/dashboard/watchlist-actions';
import { POPULAR_PAIRS, WORLD_PAIRS } from '@/lib/pairs';
import type { Currency } from '@/lib/frankfurter';

const SUGGESTION_COUNT = 6;

type Props = { currencies: Currency[]; saved: string[]; max: number };

// Menambah pasangan langsung dari Pantauan: pilih sendiri, atau sekali klik
// dari saran pasangan populer yang belum dipantau.
export default function AddPair({ currencies, saved, max }: Props) {
  const router = useRouter();
  const suggestions = [...POPULAR_PAIRS, ...WORLD_PAIRS].filter((pair) => !saved.includes(pair));
  const [initialFrom, initialTo] = (suggestions[0] ?? 'USD/IDR').split('/');
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const full = saved.length >= max;
  const pair = `${from}/${to}`;
  const alreadySaved = saved.includes(pair);
  const options = currencies.map((c) => ({ value: c.code, label: `${c.code} - ${c.name}` }));

  function add(base: string, quote: string) {
    startTransition(async () => {
      const result = await toggleWatchAction(base, quote);
      if ('error' in result) return setError(result.error);
      setError(null);
      router.refresh();
    });
  }

  if (full) {
    return (
      <p className="text-sm text-muted">
        Pantauan sudah penuh ({max} pasangan). Hapus satu pasangan untuk menambah yang lain.
      </p>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <SelectMenu options={options} value={from} onChange={setFrom} searchable className="min-w-0 flex-1" />
        <button
          type="button"
          onClick={() => {
            setFrom(to);
            setTo(from);
          }}
          aria-label="Tukar pasangan mata uang"
          className="flex size-9 shrink-0 items-center justify-center bg-accent-soft text-muted hover:text-ink"
        >
          <SwapIcon className="size-4" />
        </button>
        <SelectMenu options={options} value={to} onChange={setTo} searchable className="min-w-0 flex-1" />
      </div>

      <button
        type="button"
        onClick={() => add(from, to)}
        disabled={pending || from === to || alreadySaved}
        className="mt-3 h-10 w-full bg-ink text-sm font-medium text-paper hover:opacity-90 disabled:opacity-40"
      >
        {pending ? 'Menyimpan…' : alreadySaved ? `${pair} sudah dipantau` : `Pantau ${pair}`}
      </button>
      {from === to && <p className="mt-2 text-sm text-down">Pilih dua mata uang yang berbeda.</p>}

      {suggestions.length > 0 && (
        <>
          <p className="mt-5 text-xs text-muted">Pasangan populer</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestions.slice(0, SUGGESTION_COUNT).map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => add(...(suggestion.split('/') as [string, string]))}
                disabled={pending}
                className="h-8 bg-accent-soft px-3 font-mono text-sm text-ink hover:bg-line disabled:opacity-40"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </>
      )}
      {error && <p className="mt-3 text-sm text-down">{error}</p>}
    </div>
  );
}
