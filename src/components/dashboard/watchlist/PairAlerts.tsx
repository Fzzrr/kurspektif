'use client';

import { useState, useTransition, type FormEvent, type ReactNode } from 'react';
import { BellIcon, CloseIcon } from '@/components/ui/icons';
import PillTabs from '../ui/PillTabs';
import { formatRate } from '@/lib/rateStats';
import {
  POSITION_PERCENTS,
  describeCondition,
  isPositional,
  parseThreshold,
  type AlertDirection,
  type RateAlertDTO,
} from '@/lib/alerts';
import { createAlertAction, deleteAlertAction } from '@/app/dashboard/alert-actions';

const DIRECTION_OPTIONS = [
  { value: 'atas', label: 'Di atas' },
  { value: 'bawah', label: 'Di bawah' },
  { value: 'murah', label: 'Termurah' },
  { value: 'mahal', label: 'Termahal' },
] as const;
const PERCENT_OPTIONS = POSITION_PERCENTS.map((p) => ({ value: String(p), label: `${p}% setahun` }));

const dateFormatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', timeZone: 'Asia/Jakarta' });

type Props = {
  base: string;
  quote: string;
  rate: number | null;
  initialAlerts: RateAlertDTO[];
  /** Tombol lain di ujung kanan baris (grafik, hapus). */
  actions: ReactNode;
};

// Alert milik satu pasangan, plus komposer ringkas untuk membuatnya di tempat.
// Mengedit tetap di kartu Alert dashboard; di sini cukup lihat, buat, hapus.
export default function PairAlerts({ base, quote, rate, initialAlerts, actions }: Props) {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState<AlertDirection>('bawah');
  // Batas kurs sengaja kosong: mengisi kurs sekarang membuat "di bawah" langsung tercapai.
  const [threshold, setThreshold] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();

  const positional = isPositional(direction);
  const valid = parseThreshold(threshold) !== null;

  function changeDirection(next: AlertDirection) {
    if (isPositional(next) !== positional) setThreshold(isPositional(next) ? '20' : '');
    setDirection(next);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid || saving) return;
    startSaving(async () => {
      const result = await createAlertAction({ base, quote, direction, threshold });
      if (result.error !== undefined) return setError(result.error);
      setAlerts((current) => [...current, result.alert]);
      setError(null);
      setOpen(false);
    });
  }

  function handleRemove(id: string) {
    const previous = alerts;
    setAlerts((current) => current.filter((alert) => alert.id !== id));
    deleteAlertAction(id).then((result) => {
      if (result.error) {
        setAlerts(previous);
        setError(result.error);
      }
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <BellIcon className="size-4 shrink-0 text-muted" />
        {alerts.length === 0 && <span className="text-sm text-muted">Belum ada alert</span>}
        {alerts.map((alert) => {
          const condition = describeCondition(
            alert.direction,
            isPositional(alert.direction) ? String(alert.threshold) : formatRate(alert.threshold),
            alert.quote,
          );
          return (
            <span
              key={alert.id}
              className={`flex h-8 items-center gap-1 bg-accent-soft pl-3 text-sm ${alert.triggeredAt ? 'text-muted' : 'text-ink'}`}
            >
              {alert.triggeredAt
                ? `Tercapai ${dateFormatter.format(new Date(alert.triggeredAt))}: ${condition}`
                : condition.charAt(0).toUpperCase() + condition.slice(1)}
              <button
                type="button"
                onClick={() => handleRemove(alert.id)}
                aria-label={`Hapus alert ${condition}`}
                className="flex size-8 items-center justify-center text-muted hover:text-ink"
              >
                <CloseIcon className="size-3.5" />
              </button>
            </span>
          );
        })}
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="h-8 px-2 text-sm text-ink underline decoration-muted underline-offset-4 hover:decoration-ink"
          >
            Pasang alert
          </button>
        )}
        <div className="ml-auto flex items-center gap-2">{actions}</div>
      </div>

      {open && (
        <form onSubmit={handleSubmit} className="menu-in mt-4 space-y-3 bg-paper/60 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <PillTabs options={DIRECTION_OPTIONS} value={direction} onChange={changeDirection} />
            {positional ? (
              <PillTabs options={PERCENT_OPTIONS} value={threshold} onChange={setThreshold} />
            ) : (
              <label className="flex h-9 items-center bg-accent-soft focus-within:ring-2 focus-within:ring-accent/40">
                <span className="sr-only">Batas kurs</span>
                <input
                  value={threshold}
                  onChange={(event) => setThreshold(event.target.value.replace(/[^\d.,]/g, ''))}
                  inputMode="decimal"
                  placeholder={rate !== null ? formatRate(rate) : '0'}
                  autoFocus
                  className="w-32 bg-transparent px-3 font-mono text-sm text-ink outline-none placeholder:text-muted"
                />
                <span className="pr-3 text-xs text-muted">{quote}</span>
              </label>
            )}
          </div>

          <p className="text-sm text-muted">
            {valid ? (
              <>
                Email dikirim saat {base}/{quote}{' '}
                <span className="text-ink">{describeCondition(direction, threshold, quote)}</span>.
              </>
            ) : (
              'Tulis batas kursnya.'
            )}
            {!positional && rate !== null && ` Kurs sekarang ${formatRate(rate)} ${quote}.`}
          </p>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!valid || saving}
              className="bg-ink px-4 py-2 text-sm font-medium text-paper hover:opacity-90 disabled:opacity-40"
            >
              {saving ? 'Menyimpan…' : 'Pasang alert'}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setError(null);
              }}
              className="bg-accent-soft px-4 py-2 text-sm text-muted hover:text-ink"
            >
              Batal
            </button>
          </div>
        </form>
      )}
      {error && <p className="mt-2 text-sm text-down">{error}</p>}
    </div>
  );
}
