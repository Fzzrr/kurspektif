'use client';

// Halaman "Catatan tukar": penukaran yang benar-benar dilakukan pengguna,
// dibandingkan dengan kurs tengah referensi di hari yang sama. Selisihnya
// adalah biaya yang diambil bank/money changer.
import { useEffect, useRef, useState } from 'react';
import { CloseIcon } from '@/components/ui/icons';
import PillTabs from '../ui/PillTabs';
import { formatRate } from '@/lib/rateStats';
import { isoToDate, todayKey } from '@/lib/timeAgo';
import { costByMonth, placeKey, SIDE_OPTIONS, costText, formatAmount, summarize, type ExchangeDTO } from '@/lib/exchanges';
import { MonthlyCostChart, TradesChart } from './ExchangeCharts';
import ExchangeSimulator from './ExchangeSimulator';
import ExchangeForm from './ExchangeForm';
import { EmptyState, FilterChip, PlacesCard, RecordRow, SummaryCard } from './ExchangeCards';
import { deleteExchangeAction } from '@/app/dashboard/exchange-actions';
import type { Currency } from '@/lib/frankfurter';

const UNDO_MS = 6000;

const monthLabel = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric', timeZone: 'UTC' });

const PERIODS = [
  { value: 'semua', label: 'Semua' },
  { value: '3', label: '3 bln' },
  { value: '6', label: '6 bln' },
  { value: '12', label: '1 thn' },
] as const;
type Period = (typeof PERIODS)[number]['value'];
const SIDE_FILTERS = [{ value: 'semua', label: 'Beli & jual' }, ...SIDE_OPTIONS] as const;
type SideFilter = (typeof SIDE_FILTERS)[number]['value'];

function monthsAgo(today: string, months: number) {
  const date = isoToDate(today);
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
                      label={`Bulan: ${monthLabel.format(isoToDate(`${month}-01`))}`}
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
                        <span className="font-medium capitalize">{monthLabel.format(isoToDate(`${key}-01`))}</span>
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

