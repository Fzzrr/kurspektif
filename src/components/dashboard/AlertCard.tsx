'use client';

// Kartu "Alert kurs". Client Component: form terkontrol + daftar alert yang
// bisa ditambah/dihapus, semuanya state lokal (tidak tersimpan ke server —
// lihat cakupan "mock data" di plan).

import { useState, type FormEvent } from 'react';
import { CloseIcon } from '@/components/ui/icons';
import DashboardCard from './ui/DashboardCard';
import { SEED_ALERTS, type AlertCondition } from '@/lib/mock/alerts';

// Versi ringkas dari `inputClass` di ui/styles.ts: sama warna/rounding/focus
// ring, tapi tanpa `w-full` karena field di sini berdampingan dalam satu
// baris, bukan ditumpuk penuh seperti form auth.
const fieldClass =
  'rounded-lg border border-line bg-surface px-3 py-2 font-mono text-sm text-ink placeholder:text-muted/60 shadow-sm transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20';

export default function AlertCard() {
  const [alerts, setAlerts] = useState<AlertCondition[]>(SEED_ALERTS);
  const [pair, setPair] = useState('USD/IDR');
  const [direction, setDirection] = useState<AlertCondition['direction']>('atas');
  const [threshold, setThreshold] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!threshold.trim()) return;

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
      <p className="text-sm font-medium">Alert kurs</p>

      <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-muted">Kabari saya jika</span>

        <input
          value={pair}
          onChange={(event) => setPair(event.target.value)}
          placeholder="USD/IDR"
          className={`${fieldClass} w-28`}
        />

        <select
          value={direction}
          onChange={(event) => setDirection(event.target.value as AlertCondition['direction'])}
          className={`${fieldClass} w-28`}
        >
          <option value="atas">di atas</option>
          <option value="bawah">di bawah</option>
        </select>

        <input
          value={threshold}
          onChange={(event) => setThreshold(event.target.value)}
          placeholder="16500"
          inputMode="decimal"
          className={`${fieldClass} w-28`}
        />

        <button
          type="submit"
          className="rounded-lg bg-accent px-5 py-2 font-mono text-sm font-medium text-ink shadow-sm transition-opacity hover:opacity-90"
        >
          Atur alert
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {alerts.map((alert) => (
          <span
            key={alert.id}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 font-mono text-xs text-ink"
          >
            {alert.pair} di {alert.direction} {alert.threshold}
            <button
              type="button"
              onClick={() => handleRemove(alert.id)}
              aria-label={`Hapus alert ${alert.pair}`}
              className="text-muted transition-colors hover:text-ink"
            >
              <CloseIcon className="size-3" />
            </button>
          </span>
        ))}
      </div>
    </DashboardCard>
  );
}