'use client';

import { useMemo } from 'react';
import { BookmarkIcon, SwapIcon } from '@/components/ui/icons';
import PillTabs from '../ui/PillTabs';
import SelectMenu from '../ui/SelectMenu';
import { currencyToFlag } from '@/lib/flags';

type Currency = { code: string; name: string };

type Props = {
  from: string;
  to: string;
  currencies: Currency[];
  /** Pasangan tersimpan (atau saran kalau belum ada) sebagai pintasan. */
  quickPairs: string[];
  saved: boolean;
  onToggleSave: () => void;
  onChange: (next: { from: string; to: string }) => void;
};

export default function PairSelector({ from, to, currencies, quickPairs, saved, onToggleSave, onChange }: Props) {
  const activePair = `${from}/${to}`;

  function handleSwap() {
    onChange({ from: to, to: from });
  }

  function handleQuickPair(value: string) {
    const [nextFrom, nextTo] = value.split('/');
    onChange({ from: nextFrom, to: nextTo });
  }

  const quickPairOptions = quickPairs.map((pair) => ({ value: pair, label: pair }));

  // Daftarnya ~30 entri dan dipakai dua kali (from & to) — dibentuk sekali saja.
  const currencyOptions = useMemo(
    () =>
      currencies.map((currency) => {
        const flag = currencyToFlag(currency.code);
        return {
          value: currency.code,
          label: `${flag ? `${flag} ` : ''}${currency.code} - ${currency.name}`,
        };
      }),
    [currencies],
  );

  return (
    <div className="flex flex-wrap items-center gap-3 ">
      {/* Trio select/swap/select jadi satu unit: menyusut bersama, dan turun
          baris bersama saat kartu lebih sempit dari basis-nya. */}
      <div className="flex min-w-0 flex-1 basis-[320px] items-center gap-3">
        <SelectMenu
          options={currencyOptions}
          value={from}
          onChange={(code) => onChange({ from: code, to })}
          className="min-w-0 flex-1"
          searchable
        />

        <button
          type="button"
          onClick={handleSwap}
          aria-label="Tukar pasangan mata uang"
          className="flex size-9 shrink-0 items-center justify-center bg-accent-soft text-muted transition-colors hover:text-ink"
        >
          <SwapIcon className="size-4" />
        </button>

        <SelectMenu
          options={currencyOptions}
          value={to}
          onChange={(code) => onChange({ from, to: code })}
          className="min-w-0 flex-1"
          searchable
        />

        <button
          type="button"
          onClick={onToggleSave}
          disabled={from === to}
          aria-pressed={saved}
          aria-label={saved ? `Hapus ${activePair} dari pasangan saya` : `Simpan ${activePair} ke pasangan saya`}
          title={saved ? 'Tersimpan — klik untuk menghapus' : 'Simpan pasangan ini'}
          className={`flex size-9 shrink-0 items-center justify-center bg-accent-soft transition-colors hover:text-ink disabled:opacity-40 ${
            saved ? 'text-ink' : 'text-muted'
          }`}
        >
          <BookmarkIcon className="size-4" filled={saved} />
        </button>
      </div>

      {/* Pill tidak pernah dikompres — kalau tidak muat, digeser horizontal. */}
      <div className="ml-auto max-w-full shrink-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <PillTabs options={quickPairOptions} value={activePair} onChange={handleQuickPair} />
      </div>
    </div>
  );
}
