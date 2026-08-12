import DashboardCard from '../ui/DashboardCard';
import { SENTIMENT } from '@/lib/sentiment';
import type { NewsItem } from '@/lib/mock/news';

type Props = { item: NewsItem };

export default function NewsCard({ item }: Props) {
  const sentiment = SENTIMENT[item.sentiment];

  return (
    <DashboardCard>
      <div className="flex items-center justify-between">
        <span
          className="rounded-full px-2.5 py-1 font-mono text-[10px] font-medium uppercase text-paper"
          style={{ backgroundColor: sentiment.color }}
        >
          {sentiment.label}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wide text-muted">{item.region}</span>
      </div>

      <p className="mt-3 text-sm font-semibold leading-snug text-ink">{item.headline}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted">{item.summary}</p>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-3 font-mono text-[10px] text-muted">
        <span>{item.source} · {item.timeAgo}</span>
        {item.pair && <span className="rounded-full bg-accent-soft px-2 py-1 text-accent">{item.pair}</span>}
      </div>
    </DashboardCard>
  );
}