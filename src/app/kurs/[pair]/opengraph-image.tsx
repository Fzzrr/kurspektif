// Gambar pratinjau halaman /kurs/[pair]: kurs terbaru, perubahan harian, dan
// grafik 90 hari. Kalau Frankfurter gagal, tetap tampil tanpa angka.
import { ImageResponse } from 'next/og';
import { Brand, DOWN, INK, LINE, MUTED, UP, frame } from '@/components/og';
import { fetchLatestRate, fetchRateSeries, resolvePairSlug, toISODate } from '@/lib/frankfurter';
import { dailyChange, formatRate } from '@/lib/rateStats';
import { isoToDate, shortDate } from '@/lib/timeAgo';

export const revalidate = 3600;
export const alt = 'Kurs hari ini dan grafik 90 hari';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const names = new Intl.DisplayNames('id', { type: 'currency' });
const CHART = { width: 1056, height: 170 };

export default async function Image({ params }: { params: Promise<{ pair: string }> }) {
  const resolved = await resolvePairSlug((await params).pair);
  const base = resolved?.base ?? '';
  const quote = resolved?.quote ?? '';

  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 90);
  const data = resolved
    ? await Promise.all([fetchLatestRate(base, quote), fetchRateSeries(base, quote, toISODate(from), toISODate(to))]).catch(
        () => null,
      )
    : null;
  const [latest, series] = data ?? [null, []];
  const change = dailyChange(series, latest);
  const color = change.changeDir === 'up' ? UP : change.changeDir === 'down' ? DOWN : MUTED;

  return new ImageResponse(
    (
      <div style={frame}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Brand />
          {latest && <div style={{ fontSize: 26, color: MUTED }}>{shortDate.format(isoToDate(latest.date))}</div>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 56 }}>
          <div style={{ fontSize: 30, color: MUTED }}>
            {resolved ? `${names.of(base)} → ${names.of(quote)}` : 'Kurs mata uang'}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 28, marginTop: 8 }}>
            <div style={{ fontSize: 64, letterSpacing: -2 }}>{resolved ? `${base}/${quote}` : 'Kurspektif'}</div>
            {latest && <div style={{ fontSize: 112, letterSpacing: -1, color: INK }}>{formatRate(latest.rate)}</div>}
            {latest && change.changeDir && (
              <div style={{ fontSize: 34, color }}>
                {`${change.changeDir === 'up' ? '+' : change.changeDir === 'down' ? '−' : ''}${change.changePercent}`}
              </div>
            )}
          </div>
        </div>

        {series.length > 1 && (
          <svg width={CHART.width} height={CHART.height} style={{ marginTop: 'auto', borderBottom: `2px solid ${LINE}` }}>
            <polyline points={sparkline(series.map((p) => p.rate))} fill="none" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          </svg>
        )}
      </div>
    ),
    size,
  );
}

function sparkline(rates: number[]) {
  const min = Math.min(...rates);
  const span = Math.max(...rates) - min || 1;
  const pad = 6;
  return rates
    .map((rate, i) => {
      const x = (i / (rates.length - 1)) * CHART.width;
      const y = pad + (1 - (rate - min) / span) * (CHART.height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}
