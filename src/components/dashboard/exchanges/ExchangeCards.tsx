'use client';

// Kartu halaman Catatan tukar: ringkasan, biaya per tempat, baris riwayat, chip
// filter, dan keadaan kosong. Tanpa state sendiri; dikendalikan ExchangeLog.
import type { ReactNode } from 'react';
import { CloseIcon } from '@/components/ui/icons';
import { formatRate } from '@/lib/rateStats';
import { fmtAbsPct } from '@/lib/moversText';
import { isoToDate, shortDate } from '@/lib/timeAgo';
import {
  placeKey,
  costText,
  exchangeCost,
  formatAmount,
  type ExchangeDTO,
  type PlaceSummary,
  type QuoteSummary,
  type Saving,
} from '@/lib/exchanges';

export function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="flex h-9 items-center gap-1 bg-ink pl-3 text-sm text-paper">
      {label}
      <button type="button" onClick={onClear} aria-label={`Hapus filter ${label}`} className="flex size-9 items-center justify-center hover:opacity-70">
        <CloseIcon className="size-3.5" />
      </button>
    </span>
  );
}


// --- Ringkasan -------------------------------------------------------------

export function SummaryCard({ summary, saving }: { summary: QuoteSummary; saving: Saving | null }) {
  const better = summary.cost < 0;
  // Persen diterjemahkan ke uang: "8.800 IDR per 1 juta" lebih mudah dibayangkan dari "0,88%".
  const unit = summary.quote === 'IDR' ? 1_000_000 : 100;
  const perUnit = (Math.abs(summary.pct) / 100) * unit;
  return (
    <section className="rounded-2xl bg-surface p-5 md:p-6">
      <h2 className="text-base font-semibold">
        {better ? 'Kursmu lebih bagus dari kurs tengah' : 'Biaya penukaranmu'}
        {summary.quote !== 'IDR' && <span className="font-normal text-muted"> · dalam {summary.quote}</span>}
      </h2>

      <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-[1.4fr_1fr_1fr] lg:divide-x lg:divide-line">
        <Stat
          label={`${better ? 'Untung' : 'Biaya'} dari ${summary.count} penukaran`}
          note={better ? 'lebih banyak dari yang didapat di kurs tengah' : 'masuk ke bank atau money changer'}
          first
        >
          <span className={`text-4xl ${better ? 'text-up' : ''}`}>{formatAmount(Math.abs(summary.cost))}</span>
          <span className="ml-1.5 text-sm font-normal text-muted">{summary.quote}</span>
        </Stat>
        <Stat
          label={better ? 'Rata-rata untung' : 'Rata-rata biaya'}
          note={`per ${formatAmount(unit)} ${summary.quote} ditukar (${fmtAbsPct(summary.pct)})`}
        >
          {formatAmount(perUnit)}
          <span className="ml-1.5 text-sm font-normal text-muted">{summary.quote}</span>
        </Stat>
        <Stat label="Total yang ditukar" note="dihitung di kurs tengah">
          {formatAmount(summary.volume)}
          <span className="ml-1.5 text-sm font-normal text-muted">{summary.quote}</span>
        </Stat>
      </dl>

      {saving && (
        <p className="mt-5 bg-paper/60 px-4 py-3 text-[15px] leading-relaxed">
          <span className="font-semibold">{saving.place}</span> paling murah buatmu ({costText(saving.pct)}). Kalau semua
          penukaran tadi lewat sana, kamu bisa hemat sekitar{' '}
          <span className="font-mono font-semibold text-up">
            {formatAmount(saving.amount)} {saving.quote}
          </span>
          .
        </p>
      )}

      <p className="mt-5 text-sm leading-relaxed text-muted">
        <span className="text-ink">Kurs tengah</span> adalah kurs acuan harian bank sentral, belum termasuk untung penukar
        uang. Makin jauh kurs yang kamu dapat dari angka itu, makin besar biayanya. Hitungan ini juga ikut gerak kurs di
        hari itu, karena kurs tengah hanya terbit sekali sehari.
      </p>
    </section>
  );
}

export function PlacesCard({
  places,
  selected,
  onSelect,
}: {
  places: PlaceSummary[];
  selected: string | null;
  onSelect: (key: string) => void;
}) {
  return (
    <section className="rounded-2xl bg-surface p-5 md:p-6">
      <h2 className="text-base font-semibold">Biaya per tempat</h2>
      {places.length >= 2 || (places.length === 1 && selected) ? (
        <>
          <p className="mt-1 text-sm text-muted">Rata-rata selisih dari kurs tengah, dari yang paling murah.</p>
          <ul className="mt-3 space-y-1">
            {places.map((place, index) => (
              <PlaceRow
                key={place.place}
                place={place}
                max={places[places.length - 1].pct}
                cheapest={index === 0 && places.length >= 2}
                active={selected === placeKey(place.place)}
                dimmed={selected !== null && selected !== placeKey(place.place)}
                onClick={() => onSelect(placeKey(place.place))}
              />
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {places.length === 1
            ? `Sejauh ini semuanya di ${places[0].place}. Begitu ada catatan dari tempat lain, keduanya dibandingkan di sini.`
            : 'Belum ada catatan dengan nama tempat. Isi kolom Tempat saat mencatat, nanti bank dan money changer dibandingkan di sini.'}
        </p>
      )}
    </section>
  );
}

function Stat({ label, note, first = false, children }: { label: string; note?: string; first?: boolean; children: ReactNode }) {
  return (
    <div className={first ? 'col-span-2 lg:col-span-1' : 'lg:pl-6'}>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className={`mt-2 font-mono font-semibold leading-none text-ink ${first ? '' : 'text-xl'}`}>{children}</dd>
      {note && <dd className="mt-2 text-xs leading-snug text-muted">{note}</dd>}
    </div>
  );
}

function PlaceRow({
  place,
  max,
  cheapest,
  active,
  dimmed,
  onClick,
}: {
  place: PlaceSummary;
  max: number;
  cheapest: boolean;
  active: boolean;
  dimmed: boolean;
  onClick: () => void;
}) {
  // Biaya nol atau untung tidak punya batang: panjangnya hanya untuk biaya.
  const width = max > 0 && place.pct > 0 ? Math.max(2, (place.pct / max) * 100) : 0;
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={`block w-full rounded-lg px-3 py-2.5 text-left transition-[background-color,opacity] ${
          active ? 'bg-accent-soft' : 'hover:bg-paper/60'
        } ${dimmed ? 'opacity-50' : ''}`}
      >
        <span className="flex items-baseline justify-between gap-3 text-sm">
          <span className="min-w-0 truncate">
            {place.place}
            <span className="ml-2 text-xs text-muted">{place.count}×</span>
            {cheapest && <span className="ml-2 bg-up/15 px-1.5 py-0.5 text-[11px] text-up">termurah</span>}
          </span>
          <span className={`shrink-0 font-mono ${place.pct < 0 ? 'text-up' : ''}`}>{costText(place.pct)}</span>
        </span>
        <span className="mt-2 block h-2 rounded-full bg-line" aria-hidden>
          <span
            className={`block h-full rounded-full transition-[width] duration-500 ${cheapest ? 'bg-up' : 'bg-muted'}`}
            style={{ width: `${width}%` }}
          />
        </span>
      </button>
    </li>
  );
}

export function EmptyState() {
  return (
    <section className="rounded-2xl bg-surface p-6">
      <h2 className="text-lg font-semibold">Belum ada penukaran tercatat</h2>
      <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-muted">
        Habis menukar uang, salin jumlah dan kursnya dari struk ke formulir. Kurs tengah di tanggal itu dicari otomatis,
        lalu selisihnya dihitung.
      </p>
      <div className="mt-5 max-w-md bg-paper/60 p-4 text-sm">
        <p className="text-muted">Contoh: beli dolar di bank</p>
        <div className="mt-2 space-y-1.5">
          <Line label="Di struk" value="1.000 USD × 18.350" />
          <Line label="Kurs tengah hari itu" value="18.150" />
          <Line label="Diambil bank" value="200.000 IDR (1,1%)" strong />
        </div>
      </div>
    </section>
  );
}

// --- Daftar ----------------------------------------------------------------

type RecordRowProps = {
  record: ExchangeDTO;
  selected: boolean;
  highlighted: boolean;
  onSelect: () => void;
  onHover: (on: boolean) => void;
  onRemove: () => void;
};

export function RecordRow({ record, selected, highlighted, onSelect, onHover, onRemove }: RecordRowProps) {
  const cost = exchangeCost(record);
  const better = cost.total < 0;
  const diff = record.rate - record.midRate;
  return (
    <li
      id={`catatan-${record.id}`}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={`flex scroll-mt-24 items-start gap-1 rounded-lg transition-colors ${
        selected ? 'bg-accent-soft' : highlighted ? 'bg-paper/60' : ''
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className="flex min-w-0 flex-1 items-start gap-3 px-2 py-4 text-left"
      >
        <span
          className={`mt-0.5 w-11 shrink-0 py-0.5 text-center text-xs ${
            selected ? 'bg-ink text-paper' : 'bg-accent-soft text-ink'
          }`}
        >
          {record.side === 'beli' ? 'Beli' : 'Jual'}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block">
            <span className="font-mono font-medium">{formatAmount(record.amount)}</span> {record.base}
          </span>
          <span className="mt-0.5 block truncate text-xs text-muted">
            {shortDate.format(isoToDate(record.date))}
            {record.place && ` · ${record.place}`}
          </span>
          <span className="mt-0.5 block text-xs text-muted">
            kurs <span className="font-mono text-ink">{formatRate(record.rate)}</span> · tengah{' '}
            <span className="font-mono">{formatRate(record.midRate)}</span>
            {record.midDate !== record.date && ` (${shortDate.format(isoToDate(record.midDate))})`} ·{' '}
            <span className="font-mono">
              {diff > 0 ? '+' : '−'}
              {formatRate(Math.abs(diff))}
            </span>
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className={`block font-mono text-sm ${better ? 'text-up' : 'text-ink'}`}>
            {formatAmount(Math.abs(cost.total))} {record.quote}
          </span>
          <span className="mt-1 block text-xs text-muted">{costText(cost.pct)}</span>
        </span>
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Hapus catatan ${record.side} ${record.amount} ${record.base} tanggal ${record.date}`}
        className="mt-3 flex size-8 shrink-0 items-center justify-center text-muted hover:bg-paper/60 hover:text-ink"
      >
        <CloseIcon className="size-3.5" />
      </button>
    </li>
  );
}

export function Line({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-muted">{label}</span>
      <span className={`text-right font-mono ${strong ? 'font-semibold text-ink' : 'text-ink'}`}>{value}</span>
    </div>
  );
}
