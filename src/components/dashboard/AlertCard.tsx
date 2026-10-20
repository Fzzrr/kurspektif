'use client';

// Kartu "Alert kurs". Client Component: form terkontrol + daftar alert yang
// bisa ditambah/dihapus, semuanya state lokal (tidak tersimpan ke server —
// lihat cakupan "mock data" di plan).

import { useMemo, useState, type FormEvent } from 'react';
import { CloseIcon, SwapIcon } from '@/components/ui/icons';
import DashboardCard from './ui/DashboardCard';
import PillTabs from './ui/PillTabs';
import SelectMenu from './ui/SelectMenu';
import { currencyToFlag } from './rate/PairSelector';
import { formatRate } from '@/components/landing/rate/RateLineChart';
import { useLiveRate } from '@/lib/useLiveRate';
import { SEED_ALERTS, type AlertCondition } from '@/lib/mock/alerts';
import type { Currency } from '@/lib/frankfurter';

const DIRECTIONS = [
  { value: 'atas', label: 'Naik di atas' },
  { value: 'bawah', label: 'Turun di bawah' },
] as const;

const labelClass = 'font-mono text-xs text-muted';

type Props = { currencies: Currency[] };

export default function AlertCard({ currencies }: Props) {
  const [alerts, setAlerts] = useState<AlertCondition[]>(SEED_ALERTS);
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('IDR');
  const [direction, setDirection] = useState<AlertCondition['direction']>('atas');
  const [threshold, setThreshold] = useState('');

  // Kurs pasangan terpilih saat ini — supaya pengguna tahu batas yang masuk
  // akal, bukan menebak angka. Cukup 2 hari data.
  const { latest } = useLiveRate(from, to, 2);
  const currentRate = latest && from !== to ? formatRate(latest.rate) : null;

  const currencyOptions = useMemo(
    () =>
      currencies.map((c) => {
        const flag = currencyToFlag(c.code);
        return { value: c.code, label: `${flag ? `${flag} ` : ''}${c.code} - ${c.name}` };
      }),
    [currencies],
  );

  const samePair = from === to;
  const canSubmit = threshold.trim() !== '' && !samePair;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    // Selalu buat array BARU — React membandingkan state lewat referensi,
    // jadi memutasi array lama di tempat tidak akan memicu render ulang.
    setAlerts((current) => [
      ...current,
      { id: crypto.randomUUID(), pair: `${from}/${to}`, direction, threshold: threshold.trim() },
    ]);
    setThreshold('');
  }

  function handleRemove(id: string) {
    setAlerts((current) => current.filter((alert) => alert.id !== id));
  }

  return (
    <DashboardCard>
      <p className="text-sm font-medium">Alert kurs</p>
      <p className="mt-1 text-sm text-muted">Kabari saya saat kurs melewati batas yang saya tentukan.</p>

      <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-0 md:divide-x md:divide-line">
        {/* Komposer: satu keputusan per baris, berlabel — bukan kalimat
            panjang berisi enam kontrol berjejer. */}
        <form onSubmit={handleSubmit} className="space-y-5 md:pr-8">
          <div>
            <p className={labelClass}>Pasangan</p>
            <div className="mt-2 flex items-center gap-2">
              <SelectMenu options={currencyOptions} value={from} onChange={setFrom} searchable className="min-w-0 flex-1" />
              <button
                type="button"
                onClick={() => {
                  setFrom(to);
                  setTo(from);
                }}
                aria-label="Tukar pasangan mata uang"
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-muted transition-colors hover:text-ink"
              >
                <SwapIcon className="size-4" />
              </button>
              <SelectMenu options={currencyOptions} value={to} onChange={setTo} searchable className="min-w-0 flex-1" />
            </div>
            {samePair && <p className="mt-2 font-mono text-xs text-down">Pilih dua mata uang yang berbeda.</p>}
          </div>

          <div>
            <p className={labelClass}>Kondisi</p>
            <PillTabs
              options={DIRECTIONS}
              value={direction}
              onChange={setDirection}
              className="mt-2 w-full [&>button]:flex-1"
            />
          </div>

          <div>
            <label htmlFor="alert-threshold" className={labelClass}>
              Batas kurs
            </label>
            <div className="mt-2 flex items-center rounded-lg bg-accent-soft transition-[box-shadow] focus-within:ring-2 focus-within:ring-accent/30">
              <input
                id="alert-threshold"
                value={threshold}
                onChange={(event) => setThreshold(event.target.value.replace(/[^\d.,]/g, ''))}
                placeholder={currentRate ?? '0'}
                inputMode="decimal"
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 font-mono text-sm text-ink outline-none placeholder:text-muted/60"
              />
              <span className="shrink-0 px-3 font-mono text-xs text-muted">{to}</span>
            </div>
            {currentRate && (
              <p className="mt-2 font-mono text-xs text-muted">
                Kurs sekarang {currentRate} {to}.{' '}
                <button
                  type="button"
                  onClick={() => setThreshold(currentRate)}
                  className="text-ink underline decoration-muted underline-offset-4 hover:decoration-ink"
                >
                  Pakai angka ini
                </button>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-lg bg-accent py-2.5 font-mono text-sm font-medium text-paper hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Buat alert
          </button>
        </form>

        <section className="md:pl-8">
          <div className="flex items-baseline justify-between">
            <p className={labelClass}>Alert aktif</p>
            <span className={labelClass}>{alerts.length}</span>
          </div>

          {alerts.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-line px-4 py-8 text-center font-mono text-xs text-muted">
              Belum ada alert. Buat satu di samping — Anda akan dikabari saat kurs melewati batasnya.
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-line">
              {alerts.map((alert) => {
                const [base, quote] = alert.pair.split('/');
                const flag = currencyToFlag(base);
                const up = alert.direction === 'atas';
                return (
                  <li key={alert.id} className="menu-in flex items-center gap-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink">
                        {flag && <span className="mr-1.5">{flag}</span>}
                        {alert.pair}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-muted">
                        {up ? 'Naik di atas' : 'Turun di bawah'}{' '}
                        <span className={up ? 'text-up' : 'text-down'}>{alert.threshold}</span> {quote}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(alert.id)}
                      aria-label={`Hapus alert ${alert.pair}`}
                      className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-accent-soft hover:text-ink"
                    >
                      <CloseIcon className="size-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </DashboardCard>
  );
}
