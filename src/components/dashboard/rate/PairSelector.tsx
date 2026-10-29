'use client';

import { useEffect, useRef, useState } from 'react';
import { BookmarkIcon, ChevronDown, SwapIcon } from '@/components/ui/icons';
import PillTabs from '../ui/PillTabs';
import SelectMenu from '../ui/SelectMenu';
import { currencyOptions } from '@/lib/currencyNames';
import type { Currency } from '@/lib/frankfurter';

// Pintasan pasangan: tiga terlihat sekaligus, sisanya digeser. Label pasangan
// selalu 7 karakter ("USD/IDR"), jadi lebar pill dibuat tetap 5,25rem; satu
// langkah geser = pill + gap (0,25rem) = 88px. Lebar jendela = 3 pill + 2 gap
// + padding PillTabs (2 × 0,25rem) = 16,75rem.
const VISIBLE_PILLS = 3;
const PILL_STEP_PX = 88;

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


  const options = currencyOptions(currencies);

  return (
    <div className="flex flex-wrap items-center gap-3 ">
      {/* Trio select/swap/select jadi satu unit: menyusut bersama, dan turun
          baris bersama saat kartu lebih sempit dari basis-nya. */}
      <div className="flex min-w-0 flex-1 basis-[320px] items-center gap-3">
        <SelectMenu
          options={options}
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
          options={options}
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
          aria-label={saved ? `Hapus ${activePair} dari pantauan` : `Simpan ${activePair} ke pantauan`}
          title={saved ? 'Tersimpan — klik untuk menghapus' : 'Simpan pasangan ini'}
          className={`flex size-9 shrink-0 items-center justify-center bg-accent-soft transition-colors hover:text-ink disabled:opacity-40 ${
            saved ? 'text-ink' : 'text-muted'
          }`}
        >
          <BookmarkIcon className="size-4" filled={saved} />
        </button>
      </div>

      <QuickPairs pairs={quickPairs} active={activePair} onSelect={handleQuickPair} />
    </div>
  );
}

function QuickPairs({ pairs, active, onSelect }: { pairs: string[]; active: string; onSelect: (pair: string) => void }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ atStart: true, atEnd: true });
  const scrollable = pairs.length > VISIBLE_PILLS;

  function updateEdges() {
    const el = scrollerRef.current;
    if (!el) return;
    setEdges({ atStart: el.scrollLeft <= 1, atEnd: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1 });
  }

  // Pasangan aktif (dipilih dari pill atau dari select) digeser ke dalam
  // jendela. Bukan scrollIntoView, yang bisa ikut menggulir halaman.
  useEffect(() => {
    const el = scrollerRef.current;
    const button = el?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (el && button) {
      if (button.offsetLeft < el.scrollLeft) {
        el.scrollTo({ left: button.offsetLeft - 4, behavior: 'smooth' });
      } else if (button.offsetLeft + button.offsetWidth > el.scrollLeft + el.clientWidth) {
        el.scrollTo({ left: button.offsetLeft + button.offsetWidth - el.clientWidth + 4, behavior: 'smooth' });
      }
    }
    updateEdges();
  }, [active, pairs]);

  const step = (direction: -1 | 1) => scrollerRef.current?.scrollBy({ left: direction * PILL_STEP_PX, behavior: 'smooth' });
  const arrowClass =
    'flex h-10 w-9 shrink-0 items-center justify-center bg-accent-soft text-muted transition-colors hover:text-ink disabled:opacity-40 disabled:hover:text-muted';

  return (
    <div className="ml-auto flex max-w-full items-center gap-1">
      {scrollable && (
        <button type="button" onClick={() => step(-1)} disabled={edges.atStart} aria-label="Pasangan sebelumnya" className={arrowClass}>
          <ChevronDown className="size-4 rotate-90" />
        </button>
      )}
      {/* `relative`: jadi offsetParent pill, supaya offsetLeft dihitung dari jendela ini. */}
      <div
        ref={scrollerRef}
        onScroll={updateEdges}
        className="relative min-w-0 max-w-[16.75rem] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <PillTabs
          options={pairs.map((pair) => ({ value: pair, label: pair }))}
          value={active}
          onChange={onSelect}
          className="[&>button]:w-[5.25rem] [&>button]:shrink-0"
        />
      </div>
      {scrollable && (
        <button type="button" onClick={() => step(1)} disabled={edges.atEnd} aria-label="Pasangan berikutnya" className={arrowClass}>
          <ChevronDown className="size-4 -rotate-90" />
        </button>
      )}
    </div>
  );
}
