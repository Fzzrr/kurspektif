// Kartu ringkasan "apa yang menggerakkan rupiah". Server Component murni —
// teks & bar proporsional dihitung sekali dari data mock, tidak ada state.
import DashboardCard from '../ui/DashboardCard';
import { MARKET_MOVER } from '@/lib/mock/rate';

const SEGMENT_COLOR = {
  positif: 'bg-up',
  netral: 'bg-neutral',
  negatif: 'bg-down',
} as const;

export default function MarketMoversCard() {
  const { summary, caption, split } = MARKET_MOVER;
  const total = split.positif + split.netral + split.negatif;

  return (
    <DashboardCard tint>
      <p className="text-sm font-medium">
        <span className="text-accent">✦</span> Yang menggerakkan rupiah minggu ini
      </p>
      <p className="mt-3 text-sm leading-relaxed text-muted">{summary}</p>

      {/* Bar proporsional: tiap segmen lebar-nya = porsi berita sentimen itu
          dari total, dihitung langsung dari `split` — bukan angka tetap. */}
      <div className="mt-4 flex h-2 overflow-hidden rounded-full">
        {(Object.keys(split) as Array<keyof typeof split>).map((sentiment) => (
          <span
            key={sentiment}
            className={SEGMENT_COLOR[sentiment]}
            style={{ width: `${(split[sentiment] / total) * 100}%` }}
          />
        ))}
      </div>
      <p className="mt-2 font-mono text-[10px] text-muted">{caption}</p>
    </DashboardCard>
  );
}
