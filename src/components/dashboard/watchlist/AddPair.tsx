'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { SwapIcon } from '@/components/ui/icons';
import SelectMenu from '../ui/SelectMenu';
import { currencyOptions } from '@/lib/currencyNames';
import { currencyToFlag } from '@/lib/flags';
import { formatRate } from '@/lib/rateStats';
import { useLiveRate } from '@/lib/useLiveRate';
import { toggleWatchAction } from '@/app/dashboard/watchlist-actions';
import { POPULAR_PAIRS, WORLD_PAIRS } from '@/lib/pairs';
import type { Currency } from '@/lib/frankfurter';

const SUGGESTION_COUNT = 6;
const dateFormatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', timeZone: 'UTC' });

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
  const options = currencyOptions(currencies);
  // Kurs pasangan terpilih, supaya kelihatan apa yang akan dipantau sebelum disimpan.
  const { latest } = useLiveRate(from, to, 7);

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
      {/* Atas-bawah, bukan berdampingan: kolom samping ini sempit, dan nama
          mata uangnya baru terbaca kalau pilihannya selebar kartu. */}
      <p className="text-xs text-muted">Dari</p>
      <SelectMenu options={options} value={from} onChange={setFrom} searchable className="mt-2" />
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-muted">Ke</p>
        <button
          type="button"
          onClick={() => {
            setFrom(to);
            setTo(from);
          }}
          aria-label="Tukar pasangan mata uang"
          className="-my-1 flex h-7 items-center gap-1.5 px-2 text-xs text-muted hover:bg-accent-soft hover:text-ink"
        >
          <SwapIcon className="size-3.5 rotate-90" />
          Tukar
        </button>
      </div>
      <SelectMenu options={options} value={to} onChange={setTo} searchable className="mt-2" />

      <p className="mt-4 min-h-5 text-sm text-muted">
        {from !== to && latest && (
          <>
            1 {from} = <span className="font-mono text-ink">{formatRate(latest.rate)}</span> {to}
            <span className="text-xs"> · kurs {dateFormatter.format(new Date(latest.date))}</span>
          </>
        )}
      </p>

      <button
        type="button"
        onClick={() => add(from, to)}
        disabled={pending || from === to || alreadySaved}
        className="mt-2 h-10 w-full bg-ink text-sm font-medium text-paper hover:opacity-90 disabled:opacity-40"
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
                aria-label={`Pantau ${suggestion}`}
                className="flex h-8 items-center gap-1.5 bg-accent-soft px-2.5 font-mono text-sm text-ink hover:bg-line disabled:opacity-40"
              >
                <span className="text-base leading-none">{currencyToFlag(suggestion.slice(0, 3))}</span>
                {suggestion}
                <span className="text-muted">+</span>
              </button>
            ))}
          </div>
        </>
      )}
      {error && <p className="mt-3 text-sm text-down">{error}</p>}
    </div>
  );
}
