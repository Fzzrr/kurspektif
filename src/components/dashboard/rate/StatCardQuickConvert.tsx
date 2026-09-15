'use client';

// Kartu konversi cepat. `amount` adalah controlled input — nilainya selalu
// berasal dari state React, bukan dari DOM, jadi hasil konversi di bawahnya
// otomatis ikut berubah setiap ketikan tanpa kode tambahan.
import { useState } from 'react';
import DashboardCard from '../ui/DashboardCard';
import { formatRate } from '@/components/landing/rate/RateLineChart';

type Props = {
  rate?: number;
  fromCode?: string;
  toCode?: string;
};

const QUICK_AMOUNTS = [1, 100, 10_000, 1_000_000];

const formatAmount = (value: number) => new Intl.NumberFormat('id-ID').format(value);
const formatResult = (value: number) =>
  new Intl.NumberFormat('id-ID', { maximumFractionDigits: value >= 1 ? 2 : 6 }).format(value);

// Buang semua karakter selain digit ("1.000.000" -> 1000000) supaya titik
// pemisah ribuan ala id-ID tidak ikut dianggap bagian dari angka.
const parseAmount = (raw: string) => Number(raw.replace(/\D/g, '')) || 0;

export default function StatCardQuickConvert({ rate = 16234, fromCode = 'USD', toCode = 'IDR' }: Props) {
  const [amount, setAmount] = useState('1.000.000');
  const [copied, setCopied] = useState(false);

  // Dihitung ulang tiap render dari `amount` — bukan disimpan sebagai state
  // terpisah, supaya tidak ada dua sumber kebenaran yang bisa tidak sinkron.
  const parsed = parseAmount(amount);
  const result = parsed * rate;

  function handleAmountChange(raw: string) {
    // Format ulang ke pemisah ribuan saat mengetik; kosong tetap kosong.
    const digits = raw.replace(/\D/g, '');
    setAmount(digits ? formatAmount(Number(digits)) : '');
  }

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(`${formatResult(result)} ${toCode}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard bisa ditolak (mis. bukan HTTPS) — abaikan, tidak kritis
    }
  }

  return (
    <DashboardCard className="flex flex-col">
      <p className="font-mono text-xs text-muted">Konversi cepat</p>

      <label className="mt-3 flex items-center rounded-lg border border-line bg-surface transition-[border-color,box-shadow] focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20">
        <input
          type="text"
          inputMode="numeric"
          value={amount}
          onChange={(event) => handleAmountChange(event.target.value)}
          placeholder="0"
          aria-label={`Jumlah dalam ${fromCode}`}
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 font-mono text-lg text-ink outline-none placeholder:text-muted/60"
        />
        <span className="shrink-0 border-l border-line px-3 py-2.5 font-mono text-xs text-muted">{fromCode}</span>
      </label>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {QUICK_AMOUNTS.map((value) => {
          const isActive = parsed === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setAmount(formatAmount(value))}
              className={`rounded-full border px-2.5 py-1 font-mono text-[11px] ${
                isActive ? 'border-accent bg-accent-soft text-ink' : 'border-line text-muted hover:bg-accent-soft hover:text-ink'
              }`}
            >
              {formatAmount(value)}
            </button>
          );
        })}
      </div>

      <div className="mt-auto flex items-end justify-between gap-3 pt-4">
        <div className="min-w-0">
          <p className="truncate font-mono text-2xl font-semibold tracking-tight text-ink">
            {formatResult(result)} <span className="text-sm font-normal text-muted">{toCode}</span>
          </p>
          <p className="mt-1 font-mono text-[11px] text-muted">
            1 {fromCode} = {formatRate(rate)} {toCode}
          </p>
        </div>
        <button
          type="button"
          onClick={copyResult}
          className="shrink-0 rounded-full border border-line px-3 py-1.5 font-mono text-[11px] text-muted hover:bg-accent-soft hover:text-ink"
        >
          {copied ? 'Tersalin' : 'Salin'}
        </button>
      </div>
    </DashboardCard>
  );
}
