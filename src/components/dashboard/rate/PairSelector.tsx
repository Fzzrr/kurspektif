'use client';

import { SwapIcon } from '@/components/ui/icons';
import PillTabs from '../ui/PillTabs';

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

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3">
      <CurrencySelect value={from} currencies={currencies} onChange={(code) => onChange({ from: code, to })} />

      <button
        type="button"
        onClick={handleSwap}
        aria-label="Tukar pasangan mata uang"
        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-colors hover:bg-paper hover:text-ink"
      >
        <SwapIcon className="size-4" />
      </button>

      <CurrencySelect value={to} currencies={currencies} onChange={(code) => onChange({ from, to: code })} />

      <PillTabs options={quickPairOptions} value={activePair} onChange={handleQuickPair} className="ml-auto" />
    </div>
  );
}

type CurrencySelectProps = {
  value: string;
  currencies: Currency[];
  onChange: (value: string) => void;
};

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

function CurrencySelect({ value, currencies, onChange }: CurrencySelectProps) {
  return (
    <label className="flex max-w-[300px] shrink-0 items-center gap-2 rounded-full border border-line px-3 py-2 font-mono text-sm text-ink">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full truncate bg-transparent outline-none"
      >
        {currencies.map((currency) => {
          const flag = currencyToFlag(currency.code);
          return (
            <option key={currency.code} value={currency.code}>
              {flag ? `${flag} ` : ''}
              {currency.code} - {currency.name}
            </option>
          );
        })}
      </select>
    </label>
  );
}