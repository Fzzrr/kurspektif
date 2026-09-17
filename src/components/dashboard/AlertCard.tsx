'use client';

// Kartu "Alert kurs". Client Component: form terkontrol + daftar alert yang
// bisa ditambah/dihapus, semuanya state lokal (tidak tersimpan ke server —
// lihat cakupan "mock data" di plan).

import { useState, type FormEvent } from 'react';
import { BellIcon, CloseIcon } from '@/components/ui/icons';
import DashboardCard from './ui/DashboardCard';
import PillTabs from './ui/PillTabs';
import SelectMenu from './ui/SelectMenu';
import { currencyToFlag } from './rate/PairSelector';
import { SEED_ALERTS, type AlertCondition } from '@/lib/mock/alerts';
import type { Currency } from '@/lib/frankfurter';

const DIRECTIONS = [
  { value: 'atas', label: 'di atas' },
  { value: 'bawah', label: 'di bawah' },
] as const;

type Props = { currencies: Currency[] };

export default function AlertCard({ currencies }: Props) {
  const [alerts, setAlerts] = useState<AlertCondition[]>(SEED_ALERTS);
  const [pair, setPair] = useState('USD/IDR');
  const [direction, setDirection] = useState<AlertCondition['direction']>('atas');
  const [threshold, setThreshold] = useState('');

  // Pasangan alert selalu terhadap rupiah — fokus produk; label diberi
  // bendera & nama seperti pemilih mata uang di atas.
  const pairOptions = currencies
    .filter((c) => c.code !== 'IDR')
    .map((c) => {
      const flag = currencyToFlag(c.code);
      return { value: `${c.code}/IDR`, label: `${flag ? `${flag} ` : ''}${c.code}/IDR` };
    });

  const canSubmit = threshold.trim() !== '';

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    // Selalu buat array BARU (spread ...current lalu tambahkan elemen baru)
    // alih-alih current.push(...) — React membandingkan state lama vs baru
    // lewat referensi, jadi memutasi array lama di tempat tidak akan memicu
    // render ulang.
    setAlerts((current) => [
      ...current,
      { id: crypto.randomUUID(), pair, direction, threshold: threshold.trim() },
    ]);
    setThreshold('');
  }

  function handleRemove(id: string) {
    setAlerts((current) => current.filter((alert) => alert.id !== id));
  }

  return (
    <DashboardCard>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">Alert kurs</p>
        <span className="font-mono text-[11px] text-muted">{alerts.length} aktif</span>
      </div>

      <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-muted">Kabari saya jika</span>

        <SelectMenu options={pairOptions} value={pair} onChange={setPair} searchable className="w-40" />

        <PillTabs options={DIRECTIONS} value={direction} onChange={setDirection} />

        <label className="flex items-center rounded-lg bg-accent-soft transition-[box-shadow] focus-within:ring-2 focus-within:ring-accent/30">
          <input
            value={threshold}
            onChange={(event) => setThreshold(event.target.value.replace(/[^\d.,]/g, ''))}
            placeholder="16.500"
            inputMode="decimal"
            aria-label="Ambang kurs"
            className="w-24 min-w-0 bg-transparent px-3 py-2 font-mono text-sm text-ink outline-none placeholder:text-muted/60"
          />
          <span className="shrink-0 px-2.5 py-2 font-mono text-[11px] text-muted">IDR</span>
        </label>

        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-lg bg-accent px-5 py-2 font-mono text-sm font-medium text-paper shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Atur alert
        </button>
      </form>

      {alerts.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-line px-4 py-6 text-center font-mono text-xs text-muted">
          Belum ada alert. Atur satu di atas — Anda akan dikabari saat kurs melewati ambangnya.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-line">
          {alerts.map((alert) => (
            <li key={alert.id} className="menu-in flex items-center gap-3 py-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-muted">
                <BellIcon className="size-4" />
              </span>
              <p className="min-w-0 flex-1 font-mono text-sm text-ink">
                <span className="font-medium">{alert.pair}</span>
                <span className="text-muted"> di {alert.direction} </span>
                <span className={alert.direction === 'atas' ? 'text-up' : 'text-down'}>
                  {alert.direction === 'atas' ? '↑' : '↓'} {alert.threshold}
                </span>
              </p>
              <button
                type="button"
                onClick={() => handleRemove(alert.id)}
                aria-label={`Hapus alert ${alert.pair}`}
                className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted hover:bg-accent-soft hover:text-ink"
              >
                <CloseIcon className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
