'use client';

// Formulir "Catat penukaran" dengan pratinjau kurs tengah dan perkiraan biaya.
import { useState, useTransition, type FormEvent, type ReactNode } from 'react';
import PillTabs from '../ui/PillTabs';
import SelectMenu from '../ui/SelectMenu';
import { parseThreshold } from '@/lib/alerts';
import { currencyOptions } from '@/lib/currencyNames';
import { formatRate } from '@/lib/rateStats';
import { fmtAbsPct } from '@/lib/moversText';
import { useLiveRate } from '@/lib/useLiveRate';
import { FIRST_RATE_DATE, isoToDate, shortDate, todayKey } from '@/lib/timeAgo';
import { SIDE_OPTIONS, exchangeCost, formatAmount, type ExchangeDTO, type ExchangeSide } from '@/lib/exchanges';
import { Line } from './ExchangeCards';
import { createExchangeAction } from '@/app/dashboard/exchange-actions';
import type { Currency } from '@/lib/frankfurter';

const labelClass = 'text-xs text-muted';
const inputClass =
  'h-10 w-full bg-accent-soft px-3 font-mono text-sm text-ink outline-none placeholder:font-sans placeholder:text-muted focus:ring-2 focus:ring-accent/40';

// --- Formulir --------------------------------------------------------------

// Pratinjau kurs tengah hanya untuk tanggal yang masih masuk satu permintaan
// /api/rates yang wajar; tanggal lebih lama tetap dihitung saat disimpan.
const PREVIEW_MAX_DAYS = 400;

type FormProps = {
  currencies: Currency[];
  /** Penukaran yang diulang lewat "Catat lagi"; jumlah dan kurs sengaja dikosongkan. */
  prefill?: ExchangeDTO;
  onAdded: (record: ExchangeDTO) => void;
};

export default function ExchangeForm({ currencies, prefill, onAdded }: FormProps) {
  const [side, setSide] = useState<ExchangeSide>(prefill?.side ?? 'beli');
  const [base, setBase] = useState(prefill?.base ?? 'USD');
  const [quote, setQuote] = useState(prefill?.quote ?? 'IDR');
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');
  const [date, setDate] = useState(todayKey);
  const [place, setPlace] = useState(prefill?.place ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();

  const options = currencyOptions(currencies);
  // Nama lengkap di kalimat penjelas: di tombol pilihannya nama sering terpotong.
  const named = (code: string) => {
    const local = currencies.find((c) => c.code === code)?.localName;
    return local ? `${local} (${code})` : code;
  };
  const amountValue = parseThreshold(amount);
  const rateValue = parseThreshold(rate);
  const canSubmit = amountValue !== null && rateValue !== null && base !== quote && date !== '' && !saving;

  // Kurs tengah di tanggal terpilih, untuk perkiraan biaya sebelum disimpan.
  const daysAgo = date ? Math.round((isoToDate(todayKey()).getTime() - isoToDate(date).getTime()) / 86_400_000) : 0;
  const previewable = date !== '' && base !== quote && daysAgo <= PREVIEW_MAX_DAYS;
  const live = useLiveRate(base, quote, previewable ? daysAgo + 10 : 10);
  const mid = previewable
    ? (live.series.findLast((point) => point.date <= date) ?? (live.latest && live.latest.date <= date ? live.latest : null))
    : null;
  const estimate = mid && amountValue !== null && rateValue !== null
    ? exchangeCost({ side, amount: amountValue, rate: rateValue, midRate: mid.rate })
    : null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    startSaving(async () => {
      const result = await createExchangeAction({ side, base, quote, amount, rate, date, place });
      if ('error' in result) return setError(result.error);
      onAdded(result.record);
      setAmount('');
      setRate('');
      setPlace('');
      setError(null);
    });
  }

  return (
    <form onSubmit={submit} className="mt-5 space-y-4">
      <div>
        <PillTabs options={SIDE_OPTIONS} value={side} onChange={setSide} className="w-full [&>button]:flex-1" />
        <p className="mt-2 text-xs text-muted">
          {side === 'beli'
            ? `Kamu menerima ${named(base)} dan membayar dengan ${named(quote)}.`
            : `Kamu menyerahkan ${named(base)} dan menerima ${named(quote)}.`}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="min-w-0">
          <p className={labelClass}>Mata uang asing</p>
          <SelectMenu options={options} value={base} onChange={setBase} searchable className="mt-2 min-w-0" />
        </div>
        <div className="min-w-0">
          <p className={labelClass}>{side === 'beli' ? 'Dibayar dengan' : 'Diterima dalam'}</p>
          <SelectMenu options={options} value={quote} onChange={setQuote} searchable className="mt-2 min-w-0" />
        </div>
      </div>
      {base === quote && <p className="text-xs text-down">Pilih dua mata uang yang berbeda.</p>}

      <Field label={`Jumlah ${base}`} suffix={base}>
        <input
          value={amount}
          onChange={(event) => setAmount(event.target.value.replace(/[^\d.,]/g, ''))}
          inputMode="decimal"
          placeholder="contoh 1.000"
          autoFocus={Boolean(prefill)}
          className={`${inputClass} pr-14`}
        />
      </Field>

      <Field label={`Kurs per 1 ${base}`} suffix={quote}>
        <input
          value={rate}
          onChange={(event) => setRate(event.target.value.replace(/[^\d.,]/g, ''))}
          inputMode="decimal"
          placeholder={mid ? `kurs tengah ${formatRate(mid.rate)}` : 'contoh 18.350'}
          className={`${inputClass} pr-14`}
        />
      </Field>
      {base === 'JPY' && (
        <p className="-mt-2 text-xs text-muted">
          Bank sering menulis kurs yen per 100 yen. Isi kurs per 1 yen: 12.150 per 100 yen → <span className="text-ink">121,5</span>.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <label className="block min-w-0">
          <span className={labelClass}>Tanggal</span>
          <input
            type="date"
            required
            min={FIRST_RATE_DATE}
            max={todayKey()}
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className={`${inputClass} mt-2 px-2 [color-scheme:dark]`}
          />
        </label>
        <label className="block min-w-0">
          <span className={labelClass}>Tempat (opsional)</span>
          <input
            value={place}
            onChange={(event) => setPlace(event.target.value)}
            maxLength={60}
            placeholder="mis. BCA"
            className={`${inputClass} mt-2 font-sans`}
          />
        </label>
      </div>

      <div className="space-y-1.5 bg-paper/60 p-4 text-sm">
        {amountValue !== null && rateValue !== null ? (
          <>
            <Line
              label={side === 'beli' ? 'Total dibayar' : 'Total diterima'}
              value={`${formatAmount(amountValue * rateValue)} ${quote}`}
            />
            {mid ? (
              <>
                <Line label={`Kurs tengah ${shortDate.format(isoToDate(mid.date))}`} value={formatRate(mid.rate)} />
                {estimate && (
                  <Line
                    label={estimate.total < 0 ? 'Perkiraan untung' : 'Perkiraan biaya'}
                    value={`${formatAmount(Math.abs(estimate.total))} ${quote} (${fmtAbsPct(estimate.pct)})`}
                    strong
                  />
                )}
              </>
            ) : (
              <p className="text-xs text-muted">
                {previewable && live.isLoading ? 'Mengambil kurs tengah…' : 'Kurs tengah dihitung saat disimpan.'}
              </p>
            )}
          </>
        ) : (
          <p className="text-muted">Isi jumlah dan kurs, perkiraan biayanya muncul di sini.</p>
        )}
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="h-11 w-full bg-ink text-sm font-medium text-paper hover:opacity-90 disabled:opacity-40"
      >
        {saving ? 'Menyimpan…' : 'Simpan catatan'}
      </button>
      {error && <p className="text-sm text-down">{error}</p>}

      <details className="group border-t border-line pt-4 text-sm">
        <summary className="cursor-pointer list-none text-muted hover:text-ink">
          <span className="mr-1.5 inline-block transition-transform group-open:rotate-90">›</span>
          Cara mengisi
        </summary>
        <ul className="mt-3 space-y-2 text-muted">
          <li>
            <span className="text-ink">Beli</span> kalau kamu pulang membawa mata uang asing, <span className="text-ink">Jual</span>{' '}
            kalau kamu menyerahkannya.
          </li>
          <li>
            <span className="text-ink">Jumlah</span> ditulis dalam mata uang asingnya, bukan rupiah.
          </li>
          <li>
            Struk hanya mencantumkan total? Bagi totalnya dengan jumlah: 18.350.000 ÷ 1.000 = kurs 18.350.
          </li>
          <li>Desimal pakai koma (121,5). Titik ribuan boleh ditulis, boleh tidak.</li>
          <li>Salah isi? Hapus catatannya dengan tombol × lalu catat ulang.</li>
        </ul>
      </details>
    </form>
  );
}

function Field({ label, suffix, children }: { label: string; suffix: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <span className="relative mt-2 block">
        {children}
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted">{suffix}</span>
      </span>
    </label>
  );
}
