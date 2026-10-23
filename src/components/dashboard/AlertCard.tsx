'use client';

// Kartu "Alert kurs". Alert tersimpan di database (alert-actions.ts) dan dicek
// sekali sehari oleh /api/cron/check-alerts, yang mengirim email saat batas
// tercapai.

import { useMemo, useRef, useState, useTransition, type FormEvent } from 'react';
import { CloseIcon, PencilIcon, SwapIcon } from '@/components/ui/icons';
import DashboardCard from './ui/DashboardCard';
import PillTabs from './ui/PillTabs';
import SelectMenu from './ui/SelectMenu';
import { currencyToFlag } from './rate/PairSelector';
import { formatRate } from '@/components/landing/rate/RateLineChart';
import { useLiveRate } from '@/lib/useLiveRate';
import { isHit, parseThreshold, type AlertDirection, type RateAlertDTO } from '@/lib/alerts';
import { createAlertAction, deleteAlertAction, updateAlertAction } from '@/app/dashboard/alert-actions';
import type { Currency } from '@/lib/frankfurter';

const DIRECTIONS = [
  { value: 'atas', label: 'Naik di atas' },
  { value: 'bawah', label: 'Turun di bawah' },
] as const;

const labelClass = 'font-mono text-xs text-muted';
// Zona waktu dikunci supaya render server & client sama.
const dateFormatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', timeZone: 'Asia/Jakarta' });

type Props = { currencies: Currency[]; initialAlerts: RateAlertDTO[] };

export default function AlertCard({ currencies, initialAlerts }: Props) {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('IDR');
  const [direction, setDirection] = useState<AlertDirection>('atas');
  const [threshold, setThreshold] = useState('');
  // Alert yang sedang diedit — komposer yang sama dipakai untuk membuat dan
  // mengedit, jadi tidak ada dua form berbeda.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  const thresholdRef = useRef<HTMLInputElement>(null);
  const editingAlert = alerts.find((alert) => alert.id === editingId);

  // Kurs pasangan terpilih saat ini — supaya pengguna tahu batas yang masuk
  // akal, bukan menebak angka. Cukup 2 hari data.
  const { latest } = useLiveRate(from, to, 2);
  const samePair = from === to;
  const currentRate = latest && !samePair ? latest.rate : null;
  const thresholdValue = parseThreshold(threshold);
  const alreadyHit = currentRate !== null && thresholdValue !== null && isHit(direction, currentRate, thresholdValue);

  const currencyOptions = useMemo(
    () =>
      currencies.map((c) => {
        const flag = currencyToFlag(c.code);
        return { value: c.code, label: `${flag ? `${flag} ` : ''}${c.code} - ${c.name}` };
      }),
    [currencies],
  );

  const canSubmit = thresholdValue !== null && !samePair && !saving;
  const activeCount = alerts.filter((alert) => !alert.triggeredAt).length;

  function resetForm() {
    setThreshold('');
    setEditingId(null);
    setError(null);
  }

  function startEdit(alert: RateAlertDTO) {
    if (alert.id === editingId) return resetForm(); // klik lagi = batal
    setFrom(alert.base);
    setTo(alert.quote);
    setDirection(alert.direction);
    setThreshold(formatRate(alert.threshold));
    setEditingId(alert.id);
    setError(null);
    // Fokus juga menggulirkan form ke layar di ponsel, tempat form ada di atas daftar.
    thresholdRef.current?.focus();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    const input = { base: from, quote: to, direction, threshold };
    startSaving(async () => {
      const result = editingId ? await updateAlertAction(editingId, input) : await createAlertAction(input);
      if (result.error !== undefined) return setError(result.error);
      const saved = result.alert;
      setAlerts((current) =>
        editingId ? current.map((alert) => (alert.id === saved.id ? saved : alert)) : [...current, saved],
      );
      resetForm();
    });
  }

  function handleRemove(id: string) {
    const previous = alerts;
    setAlerts((current) => current.filter((alert) => alert.id !== id)); // langsung hilang, tanpa menunggu
    if (id === editingId) resetForm();
    deleteAlertAction(id).then((result) => {
      if (result.error) {
        setAlerts(previous);
        setError(result.error);
      }
    });
  }

  return (
    <DashboardCard>
      <p className="text-sm font-medium">Alert kurs</p>
      <p className="mt-1 text-sm text-muted">
        Kami kirim email saat kurs melewati batas yang kamu tentukan. Dicek sekali sehari dengan kurs referensi
        harian.
      </p>

      <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-0 md:divide-x md:divide-line">
        {/* Komposer: satu keputusan per baris, berlabel — bukan kalimat
            panjang berisi enam kontrol berjejer. */}
        <form onSubmit={handleSubmit} className="space-y-5 md:pr-8">
          {editingAlert && (
            <p className="font-mono text-xs text-ink">
              Mengedit alert {editingAlert.base}/{editingAlert.quote}
            </p>
          )}
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
                ref={thresholdRef}
                id="alert-threshold"
                value={threshold}
                onChange={(event) => setThreshold(event.target.value.replace(/[^\d.,]/g, ''))}
                placeholder={currentRate !== null ? formatRate(currentRate) : '0'}
                inputMode="decimal"
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 font-mono text-sm text-ink outline-none placeholder:text-muted/60"
              />
              <span className="shrink-0 px-3 font-mono text-xs text-muted">{to}</span>
            </div>
            {currentRate !== null && (
              <p className="mt-2 font-mono text-xs text-muted">
                Kurs sekarang {formatRate(currentRate)} {to}.{' '}
                <button
                  type="button"
                  onClick={() => setThreshold(formatRate(currentRate))}
                  className="text-ink underline decoration-muted underline-offset-4 hover:decoration-ink"
                >
                  Pakai angka ini
                </button>
              </p>
            )}
            {alreadyHit && (
              <p className="mt-2 font-mono text-xs text-ink">
                Kurs sekarang sudah {direction === 'atas' ? 'di atas' : 'di bawah'} batas ini — alert akan terkirim
                pada pengecekan berikutnya.
              </p>
            )}
          </div>

          <div className="flex gap-2">
            {editingAlert && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg bg-accent-soft px-4 py-2.5 font-mono text-sm text-muted hover:text-ink"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-1 rounded-lg bg-accent py-2.5 font-mono text-sm font-medium text-paper hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? 'Menyimpan…' : editingAlert ? 'Simpan perubahan' : 'Buat alert'}
            </button>
          </div>
          {error && <p className="font-mono text-xs text-down">{error}</p>}
        </form>

        <section className="md:pl-8">
          <div className="flex items-baseline justify-between">
            <p className={labelClass}>Alert kamu</p>
            <span className={labelClass}>{activeCount} aktif</span>
          </div>

          {alerts.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-line px-4 py-8 text-center font-mono text-xs text-muted">
              Belum ada alert. Buat satu di samping — kami kirim email saat kurs melewati batasnya.
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-line">
              {alerts.map((alert) => {
                const pair = `${alert.base}/${alert.quote}`;
                const flag = currencyToFlag(alert.base);
                const up = alert.direction === 'atas';
                const editing = alert.id === editingId;
                const triggered = alert.triggeredAt !== null;
                return (
                  <li key={alert.id} className="menu-in flex items-center gap-2 py-3">
                    <div className={`min-w-0 flex-1 ${triggered ? 'opacity-60' : ''}`}>
                      <p className="text-sm font-medium text-ink">
                        {flag && <span className="mr-1.5">{flag}</span>}
                        {pair}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-muted">
                        {up ? 'Naik di atas' : 'Turun di bawah'}{' '}
                        <span className={up ? 'text-up' : 'text-down'}>{formatRate(alert.threshold)}</span>{' '}
                        {alert.quote}
                      </p>
                      {triggered && (
                        <p className="mt-0.5 font-mono text-xs text-ink">
                          Tercapai {dateFormatter.format(new Date(alert.triggeredAt!))}
                          {alert.triggeredRate !== null && ` di ${formatRate(alert.triggeredRate)}`} — edit untuk
                          mengaktifkan lagi
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => startEdit(alert)}
                      aria-label={`Edit alert ${pair}`}
                      aria-pressed={editing}
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full hover:text-ink ${
                        editing ? 'bg-accent-soft text-ink' : 'text-muted hover:bg-accent-soft'
                      }`}
                    >
                      <PencilIcon className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(alert.id)}
                      aria-label={`Hapus alert ${pair}`}
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
