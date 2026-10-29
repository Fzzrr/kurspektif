'use client';

// "Kalau menukar lagi hari ini": perkiraan biaya penukaran berikutnya di tiap
// tempat, dari rata-rata biaya pengguna sendiri di tempat itu dan kurs tengah
// terbaru. Bukan penawaran kurs sungguhan — hanya pola dari catatanmu.
import { useState } from 'react';
import PillTabs from '../ui/PillTabs';
import { parseThreshold } from '@/lib/alerts';
import { formatRate } from '@/lib/rateStats';
import { useLiveRate } from '@/lib/useLiveRate';
import { costText, formatAmount, type ExchangeDTO, type ExchangeSide, type PlaceSummary } from '@/lib/exchanges';

const SIDES = [
  { value: 'beli', label: 'Beli' },
  { value: 'jual', label: 'Jual' },
] as const;

const shortDate = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', timeZone: 'UTC' });

type Props = {
  records: ExchangeDTO[];
  /** Biaya rata-rata per tempat dari seluruh riwayat, termurah dulu. */
  places: PlaceSummary[];
  /** Biaya rata-rata seluruh penukaran, persen — dipakai kalau belum ada tempat. */
  average: number;
  quote: string;
};

export default function ExchangeSimulator({ records, places, average, quote }: Props) {
  // Mata uang yang pernah ditukar dengan `quote`, yang paling sering dulu.
  const counts = new Map<string, number>();
  for (const record of records) if (record.quote === quote) counts.set(record.base, (counts.get(record.base) ?? 0) + 1);
  const bases = [...counts].sort((a, b) => b[1] - a[1]).map(([code]) => code);

  const [base, setBase] = useState(bases[0] ?? 'USD');
  const [side, setSide] = useState<ExchangeSide>('beli');
  const [amount, setAmount] = useState('1.000');
  const { latest, isLoading } = useLiveRate(base, quote, 10);

  const amountValue = parseThreshold(amount);
  // Jumlah yang biasa kamu tukar untuk mata uang ini, terbaru dulu.
  const usual = [...new Set(records.filter((r) => r.base === base && r.quote === quote).map((r) => formatAmount(r.amount)))].slice(0, 3);
  const value = latest && amountValue !== null ? latest.rate * amountValue : null;
  const rows = (places.length > 0 ? places : [{ place: 'Rata-rata biayamu', pct: average, count: records.length, cost: 0, volume: 0 }]).map(
    (place) => {
      const cost = value !== null ? (value * place.pct) / 100 : null;
      return { ...place, cost, total: value !== null && cost !== null ? (side === 'beli' ? value + cost : value - cost) : null };
    },
  );
  const maxCost = Math.max(...rows.map((row) => row.cost ?? 0), 0);
  const cheapest = rows[0];
  const priciest = rows[rows.length - 1];

  return (
    <section className="rounded-2xl bg-surface p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Kalau menukar lagi hari ini</h2>
          <p className="mt-1 max-w-[56ch] text-sm text-muted">
            Dihitung dari selisih rata-ratamu di tiap tempat
            {latest && (
              <>
                {' '}
                dan kurs tengah {shortDate.format(new Date(`${latest.date}T00:00:00Z`))},{' '}
                <span className="font-mono text-ink">{formatRate(latest.rate)}</span> {quote} per {base}
              </>
            )}
            .
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-3">
        <PillTabs options={SIDES} value={side} onChange={setSide} />
        <label className="flex items-center bg-accent-soft focus-within:ring-2 focus-within:ring-accent/40">
          <span className="sr-only">Jumlah</span>
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value.replace(/[^\d.,]/g, ''))}
            inputMode="decimal"
            className="h-10 w-28 bg-transparent px-3 font-mono text-sm text-ink outline-none"
          />
        </label>
        {/* Satu jumlah saja hanya mengulang isi kolom di sebelahnya. */}
        {usual.length > 1 && (
          <PillTabs options={usual.map((value) => ({ value, label: value }))} value={amount} onChange={setAmount} />
        )}
        {bases.length > 1 ? (
          <PillTabs options={bases.slice(0, 5).map((code) => ({ value: code, label: code }))} value={base} onChange={setBase} />
        ) : (
          <span className="flex h-10 items-center text-sm text-muted">{base}</span>
        )}
      </div>

      {value === null ? (
        <p className="mt-5 text-sm text-muted">
          {amountValue === null ? 'Isi jumlah yang ingin ditukar.' : isLoading ? 'Mengambil kurs tengah…' : 'Kurs tengah gagal dimuat. Coba muat ulang halaman.'}
        </p>
      ) : (
        <>
          <ul className="mt-5 divide-y divide-line">
            {rows.map((row, index) => (
              <li key={row.place} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 py-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto]">
                <span className="min-w-0">
                  <span className="block truncate text-sm">
                    {row.place}
                    {index === 0 && rows.length > 1 && (
                      <span className="ml-2 bg-up/15 px-1.5 py-0.5 text-[11px] text-up">termurah</span>
                    )}
                  </span>
                  <span className="text-xs text-muted">rata-rata {costText(row.pct)}</span>
                </span>
                <span className="order-last col-span-2 block h-2 rounded-full bg-line sm:order-none sm:col-span-1" aria-hidden>
                  <span
                    className={`block h-full rounded-full transition-[width] duration-500 ${index === 0 && rows.length > 1 ? 'bg-up' : 'bg-muted'}`}
                    style={{ width: `${maxCost > 0 && (row.cost ?? 0) > 0 ? Math.max(2, ((row.cost ?? 0) / maxCost) * 100) : 0}%` }}
                  />
                </span>
                <span className="text-right">
                  <span className={`block font-mono text-sm ${(row.cost ?? 0) < 0 ? 'text-up' : ''}`}>
                    {(row.cost ?? 0) < 0 ? 'untung' : 'biaya'} ≈ {formatAmount(Math.abs(row.cost ?? 0))} {quote}
                  </span>
                  <span className="text-xs text-muted">
                    {side === 'beli' ? 'bayar' : 'terima'} ≈ {formatAmount(row.total ?? 0)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          {rows.length > 1 && cheapest.cost !== null && priciest.cost !== null && priciest.cost > cheapest.cost && (
            <p className="mt-4 bg-paper/60 px-4 py-3 text-sm">
              Lewat <span className="font-semibold">{cheapest.place}</span>, kamu hemat sekitar{' '}
              <span className="font-mono font-semibold text-up">
                {formatAmount(priciest.cost - cheapest.cost)} {quote}
              </span>{' '}
              dibanding {priciest.place}.
            </p>
          )}
        </>
      )}
    </section>
  );
}
