import Link from 'next/link';
import DashboardCard from '../ui/DashboardCard';
import SentimentBadge from './SentimentBadge';
import type { NewsItem } from '@/lib/marketaux';
import { formatTimeAgo } from '@/lib/timeAgo';

type Props = { item: NewsItem };

export default function NewsCard({ item }: Props) {

  return (
    <Link href={item.url} target="_blank" rel="noopener noreferrer" className="group block">
      <DashboardCard className="h-full group-hover:-translate-y-0.5 group-hover:border-muted/60">
        <div className="flex items-center justify-between">
          <SentimentBadge sentiment={item.sentiment} />
        </div>

        <p className="mt-3 text-sm font-semibold leading-snug text-ink underline-offset-4 decoration-muted group-hover:underline">{item.headline}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{item.summary}</p>

        <div className="mt-4 flex items-center justify-between border-t border-line pt-3 font-mono text-[10px] text-muted">
          <span>{item.source} · {formatTimeAgo(item.publishedAt)}</span>
          {item.pair && <span className="rounded-full bg-accent-soft px-2 py-1 text-accent">{item.pair}</span>}
        </div>
      </DashboardCard>
    </Link>
  );
}
