'use client';

// Halaman "Catatan tukar": penukaran yang benar-benar dilakukan pengguna,
// dibandingkan dengan kurs tengah referensi di hari yang sama. Selisihnya
// adalah biaya yang diambil bank/money changer.
import { useEffect, useRef, useState, useTransition, type FormEvent, type ReactNode } from 'react';
import { CloseIcon } from '@/components/ui/icons';
import PillTabs from '../ui/PillTabs';
import SelectMenu from '../ui/SelectMenu';
import { parseThreshold } from '@/lib/alerts';
import { currencyOptions } from '@/lib/currencyNames';
import { formatRate } from '@/lib/rateStats';
import { fmtPct } from '@/lib/moversText';
import { useLiveRate } from '@/lib/useLiveRate';
import { FIRST_RATE_DATE, todayKey } from '@/lib/timeAgo';
import {
  costByMonth,
  costText,
  exchangeCost,
  formatAmount,
  summarize,
  type ExchangeDTO,
  type ExchangeSide,
  type PlaceSummary,
  type QuoteSummary,
  type Saving,
} from '@/lib/exchanges';
import { MonthlyCostChart, TradesChart } from './ExchangeCharts';
import ExchangeSimulator from './ExchangeSimulator';
import { createExchangeAction, deleteExchangeAction } from '@/app/dashboard/exchange-actions';
import type { Currency } from '@/lib/frankfurter';

const UNDO_MS = 6000;

const SIDE_OPTIONS = [
  { value: 'beli', label: 'Beli' },
  { value: 'jual', label: 'Jual' },
] as const;

/** Persen tanpa tanda plus: "1,05%". */
const pct = (value: number) => fmtPct(Math.abs(value)).replace('+', '');

const labelClass = 'text-xs text-muted';
const inputClass =
  'h-10 w-full bg-accent-soft px-3 font-mono text-sm text-ink outline-none placeholder:font-sans placeholder:text-muted focus:ring-2 focus:ring-accent/40';
const shortDate = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const monthLabel = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const asDate = (iso: string) => new Date(`${iso}T00:00:00Z`);

const PERIODS = [
  { value: 'semua', label: 'Semua' },
  { value: '3', label: '3 bln' },
  { value: '6', label: '6 bln' },
  { value: '12', label: '1 thn' },
] as const;
type Period = (typeof PERIODS)[number]['value'];
const SIDE_FILTERS = [{ value: 'semua', label: 'Beli & jual' }, ...SIDE_OPTIONS] as const;
type SideFilter = (typeof SIDE_FILTERS)[number]['value'];

/** Kunci tempat: "BCA" dan "Bca" dianggap sama. */
const placeKey = (place: string | null) => place?.trim().toLowerCase() ?? '';

function monthsAgo(today: string, months: number) {
  const date = asDate(today);
  date.setUTCMonth(date.getUTCMonth() - months);
  return date.toISOString().slice(0, 10);
}

type Props = { currencies: Currency[]; initialRecords: ExchangeDTO[] };

export default function ExchangeLog({ currencies, initialRecords }: Props) {
  const [records, setRecords] = useState(initialRecords);
  const [error, setError] = useState<string | null>(null);
  // Ponsel & tablet: formulir diciutkan jadi tombol kalau sudah ada catatan,
  // supaya ringkasan dan grafik langsung terlihat. Layar lebar selalu terbuka.
  const [formOpen, setFormOpen] = useState(initialRecords.length === 0);

  // Filter. Grafik bulan dan kartu tempat sendiri juga filter (klik batang /
  // klik tempat), jadi keduanya dihitung tanpa filter miliknya sendiri —
  // kalau tidak, memilih satu bulan akan menyembunyikan bulan lainnya.
  const [period, setPeriod] = useState<Period>('semua');
  const [side, setSide] = useState<SideFilter>('semua');
  const [place, setPlace] = useState<string | null>(null);
  const [month, setMonth] = useState<string | null>(null);
  // Penukaran yang dipilih (klik titik grafik / baris riwayat) dan yang disorot (hover).
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  // Catatan yang baru dihapus: disembunyikan dulu, baru dihapus di server
  // setelah UNDO_MS, supaya salah klik × bisa dibatalkan.
  const pendingRef = useRef<{ record: ExchangeDTO; timer: ReturnType<typeof setTimeout> } | null>(null);
  const [removed, setRemoved] = useState<ExchangeDTO | null>(null);
  // "Catat lagi": isi formulir dengan jenis, pasangan, dan tempat penukaran terpilih.
  const [prefill, setPrefill] = useState<{ key: number; record: ExchangeDTO } | null>(null);

  // Pindah halaman sebelum waktunya habis tetap menghapus catatannya.
  useEffect(
    () => () => {
      const pending = pendingRef.current;
      if (pending) {
        clearTimeout(pending.timer);
        deleteExchangeAction(pending.record.id);
      }
    },
    [],
  );

  const cutoff = period === 'semua' ? null : monthsAgo(todayKey(), Number(period));
  const matches = (r: ExchangeDTO, skip?: 'month' | 'place') =>
    (!cutoff || r.date >= cutoff) &&
    (side === 'semua' || r.side === side) &&
    (skip === 'place' || place === null || placeKey(r.place) === place) &&
    (skip === 'month' || month === null || r.date.startsWith(month));

  const filtered = records.filter((r) => matches(r));
  const { byQuote, byPair, saving } = summarize(filtered);
  const overall = summarize(records);
  const mainQuote = overall.byQuote[0]?.quote;
  const placesForCard = summarize(records.filter((r) => matches(r, 'place'))).byPlace;
  const monthlyCost = mainQuote
    ? costByMonth(records.filter((r) => matches(r, 'month')), mainQuote, todayKey().slice(0, 7))
    : [];
  const isFiltered = period !== 'semua' || side !== 'semua' || place !== null || month !== null;
  const placeName = place === null ? null : (records.find((r) => placeKey(r.place) === place)?.place?.trim() ?? place);

  function resetFilters() {
    setPeriod('semua');
    setSide('semua');
    setPlace(null);
    setMonth(null);
  }

  // Urut tanggal terbaru dulu, sama seperti dari server.
  const withRecord = (record: ExchangeDTO) =>
    setRecords((current) => [record, ...current].sort((a, b) => b.date.localeCompare(a.date)));

  function added(record: ExchangeDTO) {
    withRecord(record);
    resetFilters();
    setSelectedId(record.id);
  }

  function takePending() {
    const pending = pendingRef.current;
    if (pending) clearTimeout(pending.timer);
    pendingRef.current = null;
    setRemoved(null);
    return pending?.record ?? null;
  }

  function commitRemove() {
    const record = takePending();
    if (!record) return;
    deleteExchangeAction(record.id).then((result) => {
      if (result.error) {
        withRecord(record);
        setError(result.error);
      }
    });
  }

  function remove(id: string) {
    const record = records.find((r) => r.id === id);
    if (!record) return;
    commitRemove(); // hapusan sebelumnya langsung jadi permanen
    setRecords((current) => current.filter((r) => r.id !== id));
    if (selectedId === id) setSelectedId(null);
    setRemoved(record);
    pendingRef.current = { record, timer: setTimeout(commitRemove, UNDO_MS) };
  }

  function undoRemove() {
    const record = takePending();
    if (record) withRecord(record);
  }

  function repeat(record: ExchangeDTO) {
    setPrefill({ key: Date.now(), record });
    setFormOpen(true);
    requestAnimationFrame(() => document.getElementById('catat-penukaran')?.scrollIntoView({ block: 'start' }));
  }

  const toggleSelect = (id: string | null) => setSelectedId((current) => (id === current ? null : id));

  // Kelompok per bulan, urut terbaru (records sudah urut tanggal).
  const months = new Map<string, ExchangeDTO[]>();
  for (const record of filtered) {
    const key = record.date.slice(0, 7);
    months.set(key, [...(months.get(key) ?? []), record]);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.02em]">Catatan tukar</h1>
      <p className="mt-2 max-w-[68ch] text-[15px] leading-relaxed text-muted">{finding(overall)}</p>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-10">
        {/* Di ponsel formulir di atas daftar; di layar lebar jadi kolom kanan. */}
        <aside className="min-w-0 xl:sticky xl:top-10 xl:col-start-2 xl:row-start-1 xl:self-start">
          {!formOpen && (
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="h-12 w-full bg-ink text-[15px] font-medium text-paper hover:opacity-90 xl:hidden"
            >
              + Catat penukaran
            </button>
          )}
          <section
            id="catat-penukaran"
            className={`scroll-mt-24 rounded-2xl bg-surface p-5 ${formOpen ? '' : 'hidden xl:block'}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">Catat penukaran</h2>
                <p className="mt-1 text-sm text-muted">Salin angkanya dari struk atau aplikasi bankmu.</p>
              </div>
              {records.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  aria-label="Tutup formulir"
                  className="flex size-8 shrink-0 items-center justify-center text-muted hover:bg-accent-soft hover:text-ink xl:hidden"
                >
                  <CloseIcon className="size-3.5" />
                </button>
              )}
            </div>
            <ExchangeForm key={prefill?.key ?? 0} currencies={currencies} prefill={prefill?.record} onAdded={added} />
          </section>
        </aside>

        <div className="min-w-0 space-y-4 xl:col-start-1 xl:row-start-1">
          {error && <p className="text-sm text-down">{error}</p>}
          {records.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <PillTabs options={PERIODS} value={period} onChange={setPeriod} />
                  <PillTabs options={SIDE_FILTERS} value={side} onChange={setSide} />
                  {placeName && <FilterChip label={`Tempat: ${placeName}`} onClear={() => setPlace(null)} />}
                  {month && (
                    <FilterChip
                      label={`Bulan: ${monthLabel.format(asDate(`${month}-01`))}`}
                      onClear={() => setMonth(null)}
                    />
                  )}
                </div>
                {isFiltered && (
                  <p className="flex flex-wrap items-baseline gap-x-3 text-sm text-muted">
                    <span>
                      Menampilkan <span className="font-mono text-ink">{filtered.length}</span> dari{' '}
                      <span className="font-mono">{records.length}</span> penukaran
                    </span>
                    <button type="button" onClick={resetFilters} className="text-ink underline underline-offset-4 hover:text-muted">
                      Hapus semua filter
                    </button>
                  </p>
                )}
              </div>

              {filtered.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-line px-4 py-10 text-center text-sm text-muted">
                  Tidak ada penukaran di rentang dan jenis ini.
                </p>
              ) : (
                <>
                  {byQuote.map((summary, index) => (
                    <SummaryCard key={summary.quote} summary={summary} saving={index === 0 ? saving : null} />
                  ))}
                  <TradesChart
                    records={filtered}
                    selectedId={selectedId}
                    hoverId={hoverId}
                    onSelect={toggleSelect}
                    onHover={setHoverId}
                    onRepeat={repeat}
                  />
                </>
              )}

              <div className="grid gap-4 lg:grid-cols-2">
                {mainQuote && (
                  <MonthlyCostChart
                    months={monthlyCost}
                    quote={mainQuote}
                    selectedMonth={month}
                    onSelectMonth={(m) => setMonth((current) => (current === m ? null : m))}
                  />
                )}
                <PlacesCard
                  places={placesForCard}
                  selected={place}
                  onSelect={(key) => setPlace((current) => (current === key ? null : key))}
                />
              </div>

              {mainQuote && overall.byQuote[0] && (
                <ExchangeSimulator records={records} places={overall.byPlace} average={overall.byQuote[0].pct} quote={mainQuote} />
              )}

              {filtered.length > 0 && (
                <section className="rounded-2xl bg-surface p-5 md:p-6">
                  <h2 className="text-base font-semibold">Riwayat penukaran</h2>
                  {byPair.length > 0 && (
                    <p className="mt-1 text-sm text-muted">
                      Kurs rata-ratamu:{' '}
                      {byPair
                        .map((p) =>
                          [
                            p.avgBuy !== null && `beli ${p.base} ${formatRate(p.avgBuy)}`,
                            p.avgSell !== null && `jual ${p.base} ${formatRate(p.avgSell)}`,
                          ]
                            .filter(Boolean)
                            .join(', '),
                        )
                        .join(' · ')}
                    </p>
                  )}

                  {[...months].map(([key, items]) => (
                    <div key={key} className="mt-6">
                      <h3 className="flex items-baseline justify-between border-b border-line pb-2 text-sm">
                        <span className="font-medium capitalize">{monthLabel.format(asDate(`${key}-01`))}</span>
                        <span className="text-xs text-muted">
                          <span className="font-mono text-ink">{items.length}</span> penukaran
                        </span>
                      </h3>
                      <ul className="divide-y divide-line">
                        {items.map((record) => (
                          <RecordRow
                            key={record.id}
                            record={record}
                            selected={record.id === selectedId}
                            highlighted={record.id === hoverId}
                            onSelect={() => toggleSelect(record.id)}
                            onHover={(on) => setHoverId(on ? record.id : null)}
                            onRemove={() => remove(record.id)}
                          />
                        ))}
                      </ul>
                    </div>
                  ))}
                </section>
              )}
            </>
          )}
        </div>
      </div>

      {removed && (
        <div
          role="status"
          className="menu-in fixed inset-x-4 bottom-24 z-50 mx-auto flex max-w-md items-center justify-between gap-4 rounded-xl bg-accent-soft py-2 pl-4 pr-2 text-sm shadow-[0_18px_40px_-16px_rgba(0,0,0,0.9)] md:bottom-8"
        >
          <span className="min-w-0 truncate">
            Catatan {removed.side} <span className="font-mono">{formatAmount(removed.amount)}</span> {removed.base} dihapus.
          </span>
          <button type="button" onClick={undoRemove} className="h-9 shrink-0 px-3 font-medium text-ink underline underline-offset-4 hover:text-muted">
            Batalkan
          </button>
        </div>
      )}
    </div>
  );
}

// Kalimat di bawah judul: temuan dari seluruh catatan, bukan cara pakai halaman.
function finding({ byQuote, byPlace }: ReturnType<typeof summarize>) {
  const main = byQuote[0];
  if (!main) return 'Kurs dari bank atau money changer, dibandingkan dengan kurs tengah di hari kamu menukar.';
  const count = `${main.count} penukaran tercatat`;
  if (byPlace.length >= 2) {
    const cheapest = byPlace[0];
    const priciest = byPlace[byPlace.length - 1];
    return `${count}. Paling murah di ${cheapest.place} (${costText(cheapest.pct)}), paling mahal di ${priciest.place} (${costText(priciest.pct)}).`;
  }
  return `${count}, rata-rata ${costText(main.pct, true)}.`;
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
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

function SummaryCard({ summary, saving }: { summary: QuoteSummary; saving: Saving | null }) {
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
          note={`per ${formatAmount(unit)} ${summary.quote} ditukar (${pct(summary.pct)})`}
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

function PlacesCard({
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

function EmptyState() {
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

function RecordRow({ record, selected, highlighted, onSelect, onHover, onRemove }: RecordRowProps) {
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
            {shortDate.format(asDate(record.date))}
            {record.place && ` · ${record.place}`}
          </span>
          <span className="mt-0.5 block text-xs text-muted">
            kurs <span className="font-mono text-ink">{formatRate(record.rate)}</span> · tengah{' '}
            <span className="font-mono">{formatRate(record.midRate)}</span>
            {record.midDate !== record.date && ` (${shortDate.format(asDate(record.midDate))})`} ·{' '}
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

function ExchangeForm({ currencies, prefill, onAdded }: FormProps) {
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
  const daysAgo = date ? Math.round((asDate(todayKey()).getTime() - asDate(date).getTime()) / 86_400_000) : 0;
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
                <Line label={`Kurs tengah ${shortDate.format(asDate(mid.date))}`} value={formatRate(mid.rate)} />
                {estimate && (
                  <Line
                    label={estimate.total < 0 ? 'Perkiraan untung' : 'Perkiraan biaya'}
                    value={`${formatAmount(Math.abs(estimate.total))} ${quote} (${pct(estimate.pct)})`}
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

function Line({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-muted">{label}</span>
      <span className={`text-right font-mono ${strong ? 'font-semibold text-ink' : 'text-ink'}`}>{value}</span>
    </div>
  );
}
