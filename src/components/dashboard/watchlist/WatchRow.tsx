import Link from 'next/link';
import RemovePairButton from '@/components/dashboard/RemovePairButton';
import PairAlerts from './PairAlerts';
import Sparkline from './Sparkline';
import { formatRate, historicalPosition } from '@/lib/rateStats';
import { fmtPct } from '@/lib/moversText';
import type { WatchedSnapshot } from '@/lib/watchlist';
import type { RateAlertDTO } from '@/lib/alerts';

type Props = { row: WatchedSnapshot; baseName: string; quoteName: string; alerts: RateAlertDTO[] };

const dateFormatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', timeZone: 'UTC' });

/** Angka turunan satu pasangan; dipakai kartu ini dan pengurutan di WatchList. */
export function watchStats(row: WatchedSnapshot) {
  const series = row.series.slice(-90);
  const latest = series.at(-1) ?? null;
  const prev = series.at(-2);
  const dayPct = latest && prev ? (latest.rate / prev.rate - 1) * 100 : null;
  const position = series.length > 1 ? historicalPosition(series, latest) : null;
  return { series, latest, dayPct, position };
}

// Satu pasangan di Pantauan: kurs dan perubahannya, posisi dalam 90 hari kerja
// (murah atau mahal dibanding biasanya), penggerak minggu ini, lalu alertnya.
export default function WatchRow({ row, baseName, quoteName, alerts }: Props) {
  const [base, quote] = row.pair.split('/');
  const { series, latest, dayPct, position } = watchStats(row);

  return (
    <article className="rounded-2xl bg-surface p-5 md:p-6">
      <div className="grid gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-8">
        <div>
          <h2 className="text-xl font-semibold tracking-[-0.01em]">{row.pair}</h2>
          <p className="mt-0.5 truncate text-sm text-muted">
            {baseName} → {quoteName}
          </p>

          <p className="mt-5 font-mono text-[28px] font-semibold leading-none">
            {row.rate !== null ? formatRate(row.rate) : '—'}
            <span className="ml-1.5 text-sm font-normal text-muted">{quote}</span>
          </p>
          <p className="mt-1.5 text-xs text-muted">
            per 1 {base}
            {row.date && ` · kurs ${dateFormatter.format(new Date(row.date))}`}
          </p>

          <dl className="mt-5 grid grid-cols-2 gap-4">
            <Change label="Hari ini" pct={dayPct} />
            <Change label="7 hari" pct={row.weekPct} />
          </dl>
        </div>

        <div className="min-w-0">
          {position ? (
            <>
              <div className="flex items-baseline justify-between gap-3 text-xs text-muted">
                <span>{series.length} hari kerja terakhir</span>
                <span className="text-ink">{positionTag(position.percentile)}</span>
              </div>
              <Sparkline points={series} quote={quote} />
              <div className="flex justify-between gap-3 font-mono text-xs text-muted">
                <span>Terendah {position.min}</span>
                <span>Tertinggi {position.max}</span>
              </div>
              <p className="mt-3 text-sm text-muted">
                {latest!.rate >= Math.max(...series.map((p) => p.rate)) ? (
                  'Kurs sekarang yang tertinggi dalam periode ini.'
                ) : position.percentile === 0 ? (
                  'Kurs sekarang yang terendah dalam periode ini.'
                ) : (
                  <>
                    Kurs sekarang lebih tinggi dari <span className="font-mono text-ink">{position.percentile}%</span>{' '}
                    hari dalam periode ini.
                  </>
                )}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">Riwayat kurs belum tersedia.</p>
          )}
          <p className="mt-3 text-sm leading-relaxed">{row.reason ?? 'Data minggu ini belum cukup.'}</p>
        </div>
      </div>

      <div className="mt-5 border-t border-line pt-4">
        <PairAlerts
          base={base}
          quote={quote}
          rate={row.rate}
          initialAlerts={alerts}
          actions={
            <>
              <Link
                href={`/dashboard?pair=${base}-${quote}`}
                className="bg-accent-soft px-3 py-2 text-sm text-ink hover:bg-line"
              >
                Lihat grafik
              </Link>
              <RemovePairButton pair={row.pair} />
            </>
          }
        />
      </div>
    </article>
  );
}

function positionTag(percentile: number) {
  if (percentile <= 20) return 'Dekat titik terendah';
  if (percentile >= 80) return 'Dekat titik tertinggi';
  return 'Di tengah kisaran';
}

function Change({ label, pct }: { label: string; pct: number | null }) {
  const flat = pct === null || fmtPct(pct) === '0%';
  const tone = flat ? 'text-muted' : pct > 0 ? 'text-up' : 'text-down';
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className={`mt-1 font-mono text-base ${tone}`}>{pct === null ? '—' : fmtPct(pct)}</dd>
    </div>
  );
}
