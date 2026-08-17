'use client';

import { useMemo } from 'react';
import { SwapIcon } from '@/components/ui/icons';
import PillTabs from '../ui/PillTabs';
import SelectMenu from '../ui/SelectMenu';

type Currency = { code: string; name: string };

type Props = {
  from: string;
  to: string;
  currencies: Currency[];
  recentPairs: string[];
  onChange: (next: { from: string; to: string }) => void;
};

export default function PairSelector({ from, to, currencies, recentPairs, onChange }: Props) {
  const activePair = `${from}/${to}`;

  function handleSwap() {
    onChange({ from: to, to: from });
  }

  function handleQuickPair(value: string) {
    const [nextFrom, nextTo] = value.split('/');
    onChange({ from: nextFrom, to: nextTo });
  }

  const quickPairOptions = recentPairs.map((pair) => ({ value: pair, label: pair }));

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
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface p-3">
      {/* Trio select/swap/select jadi satu unit: menyusut bersama, dan turun
          baris bersama saat kartu lebih sempit dari basis-nya. */}
      <div className="flex min-w-0 flex-1 basis-[320px] items-center gap-3">
        <SelectMenu
          options={currencyOptions}
          value={from}
          onChange={(code) => onChange({ from: code, to })}
          className="min-w-0 flex-1"
        />

        <button
          type="button"
          onClick={handleSwap}
          aria-label="Tukar pasangan mata uang"
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-colors hover:bg-paper hover:text-ink"
        >
          <SwapIcon className="size-4" />
        </button>

        <SelectMenu
          options={currencyOptions}
          value={to}
          onChange={(code) => onChange({ from, to: code })}
          className="min-w-0 flex-1"
        />
      </div>

      {/* Pill tidak pernah dikompres — kalau tidak muat, digeser horizontal. */}
      <div className="ml-auto max-w-full shrink-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <PillTabs options={quickPairOptions} value={activePair} onChange={handleQuickPair} />
      </div>
    </div>
  );
}

// Kode ISO 4217 -> emoji bendera. Kebanyakan kode mata uang dibentuk dari
// [kode negara][huruf mata uang] (IDR = ID + Rupiah, SGD = SG + Dollar),
// jadi dua huruf pertamanya biasanya = kode negara ISO 3166-1 alpha-2.
// Emoji bendera dibuat dari dua "regional indicator symbol" Unicode yang
// berpadanan dengan huruf A-Z — bukan gambar/aset terpisah.
function currencyToFlag(code: string): string | null {
  // Kode berawalan "X" (XAU, XDR, XAF, dst.) menurut ISO 4217 khusus untuk
  // mata uang non-negara (emas, SDR, dsb.) — tidak ada benderanya.
  if (code.startsWith('X')) return null;
  const countryCode = code.slice(0, 2).toUpperCase();
  const codePoints = [...countryCode].map((char) => 0x1f1e6 + char.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}
