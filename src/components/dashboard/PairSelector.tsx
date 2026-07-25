'use client';

// Baris pemilih pasangan mata uang: dua dropdown + tombol tukar + tab cepat.
// Client Component karena semuanya digerakkan oleh useState lokal (belum
// terhubung ke data asli — lihat catatan cakupan "mock data" di plan).

import { useState } from 'react';
import { SwapIcon } from '@/components/ui/icons';
import PillTabs from './PillTabs';

const CURRENCIES = [
  { code: 'USD', label: 'US Dollar', flag: '🇺🇸' },
  { code: 'IDR', label: 'Indonesian Rupiah', flag: '🇮🇩' },
  { code: 'EUR', label: 'Euro', flag: '🇪🇺' },
  { code: 'JPY', label: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'SGD', label: 'Singapore Dollar', flag: '🇸🇬' },
] as const;

// `(typeof CURRENCIES)[number]['code']` menurunkan union type
// "USD" | "IDR" | "EUR" | "JPY" | "SGD" langsung dari data di atas,
// jadi kalau daftar mata uang berubah, tipenya ikut berubah otomatis.
type CurrencyCode = (typeof CURRENCIES)[number]['code'];

const QUICK_PAIRS = [
  { value: 'USD/IDR', label: 'USD/IDR' },
  { value: 'EUR/IDR', label: 'EUR/IDR' },
  { value: 'JPY/IDR', label: 'JPY/IDR' },
  { value: 'SGD/IDR', label: 'SGD/IDR' },
  { value: 'USD/EUR', label: 'USD/EUR' },
] as const;

type QuickPair = (typeof QUICK_PAIRS)[number]['value'];

function findCurrency(code: CurrencyCode) {
  return CURRENCIES.find((currency) => currency.code === code) ?? CURRENCIES[0];
}

export default function PairSelector() {
  const [from, setFrom] = useState<CurrencyCode>('USD');
  const [to, setTo] = useState<CurrencyCode>('IDR');
  const [quickPair, setQuickPair] = useState<QuickPair>('USD/IDR');

  // Tukar isi kedua dropdown. Karena setFrom/setTo tidak langsung mengubah
  // `from`/`to` sebelum render berikutnya, kita simpan nilai lama ke variabel
  // dulu alih-alih membaca ulang state yang sudah "basi" di baris kedua.
  function handleSwap() {
    const previousFrom = from;
    setFrom(to);
    setTo(previousFrom);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface p-3">
      <CurrencySelect value={from} onChange={setFrom} />

      <button
        type="button"
        onClick={handleSwap}
        aria-label="Tukar pasangan mata uang"
        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-colors hover:bg-paper hover:text-ink"
      >
        <SwapIcon className="size-4" />
      </button>

      <CurrencySelect value={to} onChange={setTo} />

      <PillTabs options={QUICK_PAIRS} value={quickPair} onChange={setQuickPair} className="ml-auto" />
    </div>
  );
}

type CurrencySelectProps = {
  value: CurrencyCode;
  onChange: (value: CurrencyCode) => void;
};

// Dropdown mata uang: <select> asli yang didandani, bukan listbox custom.
// Ini menjaga navigasi keyboard & pembaca layar bekerja gratis dari browser.
function CurrencySelect({ value, onChange }: CurrencySelectProps) {
  const current = findCurrency(value);

  return (
    <label className="flex items-center gap-2 rounded-full border border-line px-3 py-2 font-mono text-sm text-ink">
      <span aria-hidden>{current.flag}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as CurrencyCode)}
        className="bg-transparent outline-none"
      >
        {CURRENCIES.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.code} - {currency.label}
          </option>
        ))}
      </select>
    </label>
  );
}
