'use client';

// Kartu "Alert kurs". Alert tersimpan di database (alert-actions.ts) dan dicek
// sekali sehari oleh /api/cron/check-alerts, yang mengirim email saat batas
// tercapai.

import { useMemo, useRef, useState, useTransition, type FormEvent } from 'react';
import { CloseIcon, PencilIcon, SwapIcon } from '@/components/ui/icons';
import DashboardCard from './ui/DashboardCard';
import PillTabs from './ui/PillTabs';
import SelectMenu from './ui/SelectMenu';
import { currencyToFlag } from '@/lib/flags';
import { formatRate } from '@/lib/rateStats';
import { useLiveRate } from '@/lib/useLiveRate';
import {
  POSITION_DAYS,
  POSITION_PERCENTS,
  isHit,
  isPositional,
  parseThreshold,
  percentileOf,
  type AlertDirection,
  type RateAlertDTO,
} from '@/lib/alerts';
import { createAlertAction, deleteAlertAction, updateAlertAction } from '@/app/dashboard/alert-actions';
import type { Currency } from '@/lib/frankfurter';

const KINDS = [
  { value: 'kurs', label: 'Angka kurs' },
  { value: 'posisi', label: 'Posisi setahun' },
] as const;
type Kind = (typeof KINDS)[number]['value'];

const RATE_DIRECTIONS = [
  { value: 'atas', label: 'Naik di atas' },
  { value: 'bawah', label: 'Turun di bawah' },
] as const;
const POSITION_DIRECTIONS = [
  { value: 'murah', label: 'Termurah' },
  { value: 'mahal', label: 'Termahal' },
] as const;
const PERCENT_OPTIONS = POSITION_PERCENTS.map((p) => ({ value: String(p), label: `${p}%` }));

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

  const kind: Kind = isPositional(direction) ? 'posisi' : 'kurs';

  // Kurs pasangan terpilih saat ini (dan posisinya dalam setahun) — supaya
  // pengguna tahu batas yang masuk akal, bukan menebak angka.
  const { latest, series } = useLiveRate(from, to, POSITION_DAYS);
  const samePair = from === to;
  const currentRate = latest && !samePair ? latest.rate : null;
  const currentPercentile =
    currentRate !== null && series.length > 1 ? percentileOf(currentRate, series.map((p) => p.rate)) : null;
  const thresholdValue = parseThreshold(threshold);
  const alreadyHit =
    currentRate !== null && thresholdValue !== null && isHit(direction, currentRate, thresholdValue, currentPercentile);

  function changeKind(next: Kind) {
    setDirection(next === 'posisi' ? 'murah' : 'atas');
    setThreshold(next === 'posisi' ? '20' : '');
  }

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
    setThreshold(isPositional(alert.direction) ? String(alert.threshold) : formatRate(alert.threshold));
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
        Kami kirim email saat kurs melewati batas yang kamu tentukan, atau masuk posisi termurah/termahal setahun.
        Dicek sekali sehari dengan kurs referensi harian.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-0 md:divide-x md:divide-line">
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
                className="flex size-9 shrink-0 items-center justify-center bg-accent-soft text-muted transition-colors hover:text-ink"
              >
                <SwapIcon className="size-4" />
              </button>
              <SelectMenu options={currencyOptions} value={to} onChange={setTo} searchable className="min-w-0 flex-1" />
            </div>
            {samePair && <p className="mt-2 font-mono text-xs text-down">Pilih dua mata uang yang berbeda.</p>}
          </div>

          <div>
            <p className={labelClass}>Jenis</p>
            <PillTabs options={KINDS} value={kind} onChange={changeKind} className="mt-2 w-full [&>button]:flex-1" />
          </div>

          <div>
            <p className={labelClass}>Kondisi</p>
            {kind === 'kurs' ? (
              <PillTabs
                options={RATE_DIRECTIONS}
                value={direction as 'atas' | 'bawah'}
                onChange={setDirection}
                className="mt-2 w-full [&>button]:flex-1"
              />
            ) : (
              <PillTabs
                options={POSITION_DIRECTIONS}
                value={direction as 'murah' | 'mahal'}
                onChange={setDirection}
                className="mt-2 w-full [&>button]:flex-1"
              />
            )}
          </div>

          {kind === 'kurs' ? (
            <div>
              <label htmlFor="alert-threshold" className={labelClass}>
                Batas kurs
              </label>
              <div className="mt-2 flex items-center bg-accent-soft transition-[box-shadow] focus-within:ring-2 focus-within:ring-accent/30">
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
            </div>
          ) : (
            <div>
              <p className={labelClass}>Masuk berapa persen hari {direction === 'murah' ? 'termurah' : 'termahal'}</p>
              <PillTabs
                options={PERCENT_OPTIONS}
                value={threshold}
                onChange={setThreshold}
                className="mt-2 w-full [&>button]:flex-1"
              />
              <p className="mt-2 font-mono text-xs text-muted">
                Kami kabari saat kurs {from}/{to} masuk {threshold}% hari{' '}
                {direction === 'murah' ? 'termurah' : 'termahal'} dalam setahun terakhir.
                {currentPercentile !== null && ` Sekarang lebih tinggi dari ${currentPercentile}% hari.`}
              </p>
            </div>
          )}
          {alreadyHit && (
            <p className="font-mono text-xs text-ink">
              Kondisi ini sudah terpenuhi sekarang — alert akan terkirim pada pengecekan berikutnya.
            </p>
          )}

          <div className="flex gap-2">
            {editingAlert && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-accent-soft px-4 py-2.5 font-mono text-sm text-muted hover:text-ink"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-1 bg-ink py-2.5 font-mono text-sm font-medium text-paper hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
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
            <p className="mt-4 border border-dashed border-line px-4 py-8 text-center font-mono text-xs text-muted">
              Belum ada alert. Kami kirim email saat kondisi yang kamu buat terpenuhi.
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
                        {isPositional(alert.direction) ? (
                          `Masuk ${alert.threshold}% ${alert.direction === 'murah' ? 'termurah' : 'termahal'} setahun`
                        ) : (
                          <>
                            {up ? 'Naik di atas' : 'Turun di bawah'}{' '}
                            <span className={up ? 'text-up' : 'text-down'}>{formatRate(alert.threshold)}</span>{' '}
                            {alert.quote}
                          </>
                        )}
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
                      className={`flex size-8 shrink-0 items-center justify-center hover:text-ink ${
                        editing ? 'bg-accent-soft text-ink' : 'text-muted hover:bg-accent-soft'
                      }`}
                    >
                      <PencilIcon className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(alert.id)}
                      aria-label={`Hapus alert ${pair}`}
                      className="flex size-8 shrink-0 items-center justify-center text-muted hover:bg-accent-soft hover:text-ink"
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
