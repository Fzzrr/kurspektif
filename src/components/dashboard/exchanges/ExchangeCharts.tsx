'use client';

// Grafik halaman Catatan tukar. Ukuran diambil dari kontainer (ResizeObserver),
// sama seperti RateLineChart, supaya tidak ada warning width/height(-1).
import { useState, type ReactNode } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceDot,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TooltipContentProps } from 'recharts';
import PillTabs from '../ui/PillTabs';
import { CloseIcon } from '@/components/ui/icons';
import { useLiveRate } from '@/lib/useLiveRate';
import { formatRate } from '@/lib/rateStats';
import { fmtAbsPct } from '@/lib/moversText';
import { isoToDate, todayKey } from '@/lib/timeAgo';
import { useElementSize } from '@/lib/useElementSize';
import { costText, exchangeCost, formatAmount, type ExchangeDTO, type MonthCost } from '@/lib/exchanges';

const tickDate = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const longDate = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const shortMonth = new Intl.DateTimeFormat('id-ID', { month: 'short', timeZone: 'UTC' });
const longMonth = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const compact = new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 });
const axisTick = { fontSize: 11, fontFamily: 'inherit', fill: 'var(--color-muted)' };

/** Skala sumbu dengan langkah bulat (1, 2, 2,5, 5 × 10^n) yang mencakup min–max. */
function niceScale(min: number, max: number, count = 4) {
  const raw = (max - min) / count || Math.abs(max) * 0.01 || 1;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((candidate) => candidate >= raw)!;
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let value = start; value <= end + step / 2; value += step) ticks.push(Number(value.toPrecision(12)));
  return { domain: [start, end] as [number, number], ticks };
}


function TooltipBox({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-64 rounded-lg bg-surface px-3 py-2 text-xs shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)]">
      {children}
    </div>
  );
}

// --- Kurs kamu vs kurs tengah -----------------------------------------------

// Satu permintaan /api/rates yang wajar; penukaran yang lebih tua tetap tercatat,
// hanya tidak tergambar.
const MAX_DAYS = 400;

type TradePoint = { date: string; mid: number; trades: ExchangeDTO[] };

type TradesChartProps = {
  records: ExchangeDTO[];
  selectedId: string | null;
  hoverId: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
  onRepeat: (trade: ExchangeDTO) => void;
};

export function TradesChart({ records, selectedId, hoverId, onSelect, onHover, onRepeat }: TradesChartProps) {
  // Pasangan diurut dari yang paling sering dicatat.
  const counts = new Map<string, number>();
  for (const record of records) counts.set(`${record.base}/${record.quote}`, (counts.get(`${record.base}/${record.quote}`) ?? 0) + 1);
  const pairs = [...counts].sort((a, b) => b[1] - a[1]).map(([pair]) => pair);
  const [chosen, setChosen] = useState<string | null>(null);
  // Penukaran yang dipilih dari riwayat menentukan pasangan yang digambar.
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const pair = selected ? `${selected.base}/${selected.quote}` : chosen && pairs.includes(chosen) ? chosen : pairs[0];
  const [base, quote] = pair.split('/');
  const trades = records.filter((record) => record.base === base && record.quote === quote);

  const today = todayKey();
  const earliest = trades.reduce((min, t) => (t.date < min ? t.date : min), today);
  const daysBack = Math.round((isoToDate(today).getTime() - isoToDate(earliest).getTime()) / 86_400_000);
  const days = Math.min(MAX_DAYS, Math.max(30, daysBack + 14));
  const { series, latest, isLoading, error } = useLiveRate(base, quote, days);
  const clipped = daysBack + 14 > MAX_DAYS;

  // Titik kurs tengah per hari; penukaran ditempel ke tanggal kurs tengahnya.
  const byDate = new Map<string, ExchangeDTO[]>();
  for (const trade of trades) byDate.set(trade.midDate, [...(byDate.get(trade.midDate) ?? []), trade]);
  const data: TradePoint[] = series.map((point) => ({ date: point.date, mid: point.rate, trades: byDate.get(point.date) ?? [] }));
  const shown = data.flatMap((point) => point.trades);

  const values = [...data.map((d) => d.mid), ...shown.map((t) => t.rate)];
  const yScale = values.length === 0 ? { domain: [0, 1] as [number, number], ticks: [0, 1] } : niceScale(Math.min(...values), Math.max(...values));

  const { ref, width, height } = useElementSize();

  return (
    <section className="rounded-2xl bg-surface p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Kursmu dibanding kurs tengah</h2>
          {latest && (
            <p className="mt-1 text-sm text-muted">
              Kurs tengah {pair} terakhir <span className="font-mono text-ink">{formatRate(latest.rate)}</span>, terbit{' '}
              {tickDate.format(isoToDate(latest.date))}.
            </p>
          )}
        </div>
        {pairs.length > 1 && (
          <div className="max-w-full overflow-x-auto [scrollbar-width:none]">
            <PillTabs
              options={pairs.map((p) => ({ value: p, label: p }))}
              value={pair}
              onChange={(next) => {
                setChosen(next);
                onSelect(null);
              }}
            />
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-muted" /> kurs tengah {pair}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-ink" /> beli
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full border-2 border-ink" /> jual
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-0.5 bg-down" /> biaya
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-0.5 bg-up" /> untung
        </span>
      </div>

      <div ref={ref} className="mt-3 h-64 w-full md:h-72" role="img" aria-label={`Grafik kurs tengah ${pair} dengan titik penukaranmu`}>
        {error ? (
          <p className="flex h-full items-center justify-center text-sm text-muted">Kurs tengah gagal dimuat.</p>
        ) : isLoading && data.length === 0 ? (
          <div className="h-full rounded-xl bg-paper/60" />
        ) : (
          width > 0 &&
          height > 0 && (
            <ComposedChart width={width} height={height} data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--color-line)" strokeDasharray="2 4" />
              <XAxis
                dataKey="date"
                tickFormatter={(d: string) => tickDate.format(isoToDate(d))}
                interval="preserveStartEnd"
                minTickGap={36}
                tickLine={false}
                axisLine={false}
                tick={axisTick}
                tickMargin={8}
              />
              <YAxis
                orientation="right"
                domain={yScale.domain}
                ticks={yScale.ticks}
                width={56}
                tickLine={false}
                axisLine={false}
                tick={axisTick}
                tickFormatter={formatRate}
              />
              <Tooltip
                cursor={{ stroke: 'var(--color-muted)', strokeWidth: 1, strokeDasharray: '3 3' }}
                content={(props) => <TradeTooltip {...(props as TooltipContentProps<number, string>)} quote={quote} />}
              />
              <Line type="linear" dataKey="mid" stroke="var(--color-muted)" strokeWidth={1.75} dot={false} isAnimationActive={false} />
              {shown.map((trade) => {
                const active = trade.id === selectedId || trade.id === hoverId;
                return (
                  <ReferenceLine
                    key={`gap-${trade.id}`}
                    segment={[
                      { x: trade.midDate, y: trade.midRate },
                      { x: trade.midDate, y: trade.rate },
                    ]}
                    stroke={exchangeCost(trade).total > 0 ? 'var(--color-down)' : 'var(--color-up)'}
                    strokeWidth={active ? 4 : 2.5}
                    strokeOpacity={selectedId && !active ? 0.35 : 1}
                  />
                );
              })}
              {selected && shown.includes(selected) && (
                <ReferenceDot
                  x={selected.midDate}
                  y={selected.rate}
                  r={13}
                  fill="none"
                  stroke="var(--color-ink)"
                  strokeOpacity={0.35}
                  strokeWidth={2}
                />
              )}
              {shown.map((trade) => {
                const active = trade.id === selectedId || trade.id === hoverId;
                return (
                  <ReferenceDot
                    key={`dot-${trade.id}`}
                    x={trade.midDate}
                    y={trade.rate}
                    r={active ? 8 : 6}
                    fill={trade.side === 'beli' ? 'var(--color-ink)' : 'var(--color-surface)'}
                    stroke="var(--color-ink)"
                    strokeWidth={2.5}
                    fillOpacity={selectedId && !active ? 0.45 : 1}
                    strokeOpacity={selectedId && !active ? 0.45 : 1}
                    className="cursor-pointer"
                    onClick={() => onSelect(trade.id)}
                    onMouseEnter={() => onHover(trade.id)}
                    onMouseLeave={() => onHover(null)}
                  />
                );
              })}
            </ComposedChart>
          )
        )}
      </div>
      {selected && <SelectedTrade trade={selected} onClose={() => onSelect(null)} onRepeat={() => onRepeat(selected)} />}
      {clipped && (
        <p className="mt-3 text-xs text-muted">
          Grafik hanya sampai {MAX_DAYS} hari ke belakang. Penukaran yang lebih lama tetap masuk ringkasan.
        </p>
      )}
    </section>
  );
}

function SelectedTrade({ trade, onClose, onRepeat }: { trade: ExchangeDTO; onClose: () => void; onRepeat: () => void }) {
  const cost = exchangeCost(trade);
  const worse = cost.total > 0;
  return (
    <div className="menu-in mt-4 flex flex-wrap items-start justify-between gap-x-6 gap-y-3 bg-paper/60 p-4">
      <div className="min-w-0">
        <p className="font-medium">
          {trade.side === 'beli' ? 'Beli' : 'Jual'} <span className="font-mono">{formatAmount(trade.amount)}</span> {trade.base}
          <span className="font-normal text-muted">
            {' '}
            · {longDate.format(isoToDate(trade.date))}
            {trade.place && ` · ${trade.place}`}
          </span>
        </p>
        <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs text-muted">Kurs kamu</dt>
            <dd className="font-mono">{formatRate(trade.rate)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Kurs tengah</dt>
            <dd className="font-mono">{formatRate(trade.midRate)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">{trade.side === 'beli' ? 'Total dibayar' : 'Total diterima'}</dt>
            <dd className="font-mono">
              {formatAmount(trade.amount * trade.rate)} {trade.quote}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">{worse ? 'Biaya' : 'Untung'}</dt>
            <dd className={`font-mono ${worse ? 'text-down' : 'text-up'}`}>
              {formatAmount(Math.abs(cost.total))} {trade.quote} ({fmtAbsPct(cost.pct)})
            </dd>
          </div>
        </dl>
      </div>
      <div className="flex items-center gap-1">
        <button type="button" onClick={onRepeat} className="h-8 bg-accent-soft px-3 text-sm text-ink hover:bg-line">
          Catat lagi
        </button>
        <button
          type="button"
          onClick={() => document.getElementById(`catatan-${trade.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
          className="h-8 px-2 text-sm text-ink underline underline-offset-4 hover:text-muted"
        >
          Lihat di riwayat
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Batalkan pilihan"
          className="flex size-8 items-center justify-center text-muted hover:bg-accent-soft hover:text-ink"
        >
          <CloseIcon className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

function TradeTooltip({ active, payload, quote }: Partial<TooltipContentProps<number, string>> & { quote: string }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as TradePoint;
  return (
    <TooltipBox>
      <p className="text-muted">{longDate.format(isoToDate(point.date))}</p>
      <p className="mt-0.5">
        Kurs tengah <span className="font-mono text-ink">{formatRate(point.mid)}</span>
      </p>
      {point.trades.map((trade) => {
        const cost = exchangeCost(trade);
        return (
          <p key={trade.id} className="mt-1.5 border-t border-line pt-1.5">
            <span className="text-ink">
              {trade.side === 'beli' ? 'Beli' : 'Jual'} {formatAmount(trade.amount)} {trade.base}
            </span>
            {trade.place && <span className="text-muted"> · {trade.place}</span>}
            <br />
            kurs <span className="font-mono text-ink">{formatRate(trade.rate)}</span> ·{' '}
            <span className={cost.total > 0 ? 'text-down' : 'text-up'}>
              {cost.total > 0 ? 'biaya' : 'untung'} {formatAmount(Math.abs(cost.total))} {quote} ({fmtAbsPct(cost.pct)})
            </span>
          </p>
        );
      })}
    </TooltipBox>
  );
}

// --- Biaya per bulan ---------------------------------------------------------

type MonthlyProps = {
  months: MonthCost[];
  quote: string;
  selectedMonth: string | null;
  onSelectMonth: (month: string) => void;
};

export function MonthlyCostChart({ months, quote, selectedMonth, onSelectMonth }: MonthlyProps) {
  const { ref, width, height } = useElementSize();
  const max = Math.max(...months.map((m) => m.cost), 0);
  const total = months.reduce((sum, m) => sum + m.cost, 0);
  const active = months.filter((m) => m.count > 0);

  // Satu bulan berisi = satu batang di kotak kosong; angkanya saja sudah cukup.
  if (active.length < 2) {
    const only = active[0];
    return (
      <section className="rounded-2xl bg-surface p-5 md:p-6">
        <h2 className="text-base font-semibold">Biaya per bulan</h2>
        {only && (
          <div className="mt-4 bg-paper/60 p-4">
            <p className="text-sm capitalize text-muted">{longMonth.format(isoToDate(`${only.month}-01`))}</p>
            <p className="mt-1.5 font-mono text-xl font-semibold">
              {formatAmount(only.cost)} <span className="text-sm font-normal text-muted">{quote}</span>
            </p>
            <p className="mt-1 text-sm text-muted">
              dari {only.count} penukaran, {costText(only.volume > 0 ? (only.cost / only.volume) * 100 : 0)}
            </p>
          </div>
        )}
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Grafik per bulan muncul setelah ada penukaran di bulan kedua.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-surface p-5 md:p-6">
      <h2 className="text-base font-semibold">Biaya per bulan</h2>
      <p className="mt-1 text-sm text-muted">
        <span className="font-mono text-ink">
          {formatAmount(total)} {quote}
        </span>{' '}
        dalam {months.length} bulan terakhir.
      </p>
      <div ref={ref} className="mt-4 h-48 w-full" role="img" aria-label="Diagram batang biaya penukaran per bulan">
        {width > 0 && height > 0 && (
          <BarChart width={width} height={height} data={months} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--color-line)" strokeDasharray="2 4" />
            <XAxis
              dataKey="month"
              tickFormatter={(m: string) => shortMonth.format(isoToDate(`${m}-01`))}
              tickLine={false}
              axisLine={false}
              tick={axisTick}
              tickMargin={8}
              interval="preserveStartEnd"
            />
            <YAxis
              orientation="right"
              width={44}
              tickCount={4}
              domain={[0, max > 0 ? 'auto' : 1]}
              tickLine={false}
              axisLine={false}
              tick={axisTick}
              tickFormatter={(v: number) => compact.format(v)}
            />
            <Tooltip
              cursor={{ fill: 'var(--color-accent-soft)' }}
              content={(props) => <MonthTooltip {...(props as TooltipContentProps<number, string>)} quote={quote} />}
            />
            <Bar
              dataKey="cost"
              radius={[3, 3, 0, 0]}
              maxBarSize={36}
              isAnimationActive={false}
              className="cursor-pointer"
              onClick={(entry) => {
                const month = (entry as { payload?: MonthCost }).payload;
                if (month && month.count > 0) onSelectMonth(month.month);
              }}
            >
              {months.map((m) => (
                <Cell
                  key={m.month}
                  fill={selectedMonth && m.month !== selectedMonth ? 'var(--color-neutral)' : 'var(--color-ink)'}
                />
              ))}
            </Bar>
          </BarChart>
        )}
      </div>
    </section>
  );
}

function MonthTooltip({ active, payload, quote }: Partial<TooltipContentProps<number, string>> & { quote: string }) {
  if (!active || !payload?.length) return null;
  const month = payload[0].payload as MonthCost;
  return (
    <TooltipBox>
      <p className="capitalize text-muted">{longMonth.format(isoToDate(`${month.month}-01`))}</p>
      {month.count === 0 ? (
        <p className="mt-0.5">Tidak ada penukaran.</p>
      ) : (
        <>
          <p className="mt-0.5">
            Biaya{' '}
            <span className="font-mono text-ink">
              {formatAmount(month.cost)} {quote}
            </span>
          </p>
          <p className="text-muted">
            {month.count} penukaran · {fmtAbsPct(month.volume > 0 ? (month.cost / month.volume) * 100 : 0)} dari nilai tukar
          </p>
        </>
      )}
    </TooltipBox>
  );
}
