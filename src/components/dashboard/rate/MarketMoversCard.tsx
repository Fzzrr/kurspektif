// Kartu ringkasan "apa yang menggerakkan rupiah". Teks & faktor penggerak
// dari mock editorial; sebaran sentimen dihitung dari berita asli.
import DashboardCard from '../ui/DashboardCard';
import { MARKET_MOVER } from '@/lib/mock/rate';
import { SENTIMENT, type Sentiment } from '@/lib/sentiment';
import type { NewsItem } from '@/lib/marketaux';

const ORDER: Sentiment[] = ['positif', 'netral', 'negatif'];
const IMPACT_GLYPH: Record<Sentiment, string> = { positif: '↑', netral: '→', negatif: '↓' };
const VERDICT: Record<Sentiment, string> = {
  positif: 'Cenderung positif',
  netral: 'Cenderung netral',
  negatif: 'Cenderung negatif',
};

const tint = (sentiment: Sentiment) => ({
  color: SENTIMENT[sentiment].color,
  backgroundColor: `color-mix(in srgb, ${SENTIMENT[sentiment].color} 15%, transparent)`,
});

type Props = { news: NewsItem[] };

export default function MarketMoversCard({ news }: Props) {
  const { summary, drivers } = MARKET_MOVER;

  const split: Record<Sentiment, number> = { positif: 0, netral: 0, negatif: 0 };
  for (const item of news) split[item.sentiment] += 1;
  const total = news.length;
  const verdict = ORDER.reduce((best, s) => (split[s] > split[best] ? s : best), 'netral' as Sentiment);

  return (
    <DashboardCard className="flex flex-col">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm font-medium">Yang menggerakkan rupiah minggu ini</p>
        {total > 0 && (
          <span className="rounded-full px-2.5 py-1 font-mono text-[10px] font-medium" style={tint(verdict)}>
            {VERDICT[verdict]}
          </span>
        )}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted">{summary}</p>

      <ul className="mt-4 divide-y divide-line border-y border-line">
        {drivers.map((driver) => (
          <li key={driver.label} className="flex items-start gap-3 py-2.5">
            <span
              className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold"
              style={tint(driver.impact)}
            >
              {IMPACT_GLYPH[driver.impact]}
            </span>
            <div className="min-w-0">
              <p className="text-sm text-ink">{driver.label}</p>
              <p className="mt-0.5 font-mono text-[11px] text-muted">{driver.detail}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* Bar proporsional: tiap segmen lebar-nya = porsi berita sentimen itu
          dari total — dihitung dari berita asli, bukan angka tetap. */}
      {total > 0 && (
        <div className="mt-auto pt-4">
          <div className="flex h-2 overflow-hidden rounded-full bg-line">
            {ORDER.map((s) => (
              <span
                key={s}
                className="transition-[width] duration-500"
                style={{ width: `${(split[s] / total) * 100}%`, backgroundColor: SENTIMENT[s].color }}
              />
            ))}
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-muted">
            <div className="flex flex-wrap gap-3">
              {ORDER.map((s) => (
                <span key={s} className="flex items-center gap-1.5">
                  <span className="inline-block size-1.5 rounded-full" style={{ backgroundColor: SENTIMENT[s].color }} />
                  {SENTIMENT[s].label} {split[s]}
                </span>
              ))}
            </div>
            <span>{total} berita</span>
          </div>
        </div>
      )}
    </DashboardCard>
  );
}
