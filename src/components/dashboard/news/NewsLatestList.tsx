import Link from 'next/link';
import DashboardCard from '../ui/DashboardCard';
import { SENTIMENT } from '@/lib/sentiment';
import type { NewsItem } from '@/lib/marketaux';
import { formatTimeAgo } from '@/lib/timeAgo';

type Props = { items: NewsItem[] };

export default function NewsLatestList({ items }: Props) {
  return (
    <section className="flex h-full flex-col">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Paling baru</p>
      <ul className="mt-3 flex flex-1 flex-col gap-3">
        {items.map((item) => (
          <li key={item.id} className="flex-1">
            <Link href={item.url} target="_blank" rel="noopener noreferrer" className="block h-full">
              <DashboardCard className="flex h-full items-center gap-4">
                <div className="min-w-0 flex-1">
                  <span
                    className="inline-block size-1.5 rounded-full"
                    style={{ backgroundColor: SENTIMENT[item.sentiment].color }}
                  />
                  <p className="mt-1 text-sm font-medium leading-snug text-ink">{item.headline}</p>
                  <p className="mt-1 font-mono text-[10px] text-muted">
                    {item.source} · {formatTimeAgo(item.publishedAt)}
                  </p>
                </div>
                {item.image && (
                  <img
                    src={item.image}
                    alt=""
                    className="size-16 shrink-0 rounded-lg border border-line object-cover"
                  />
                )}
              </DashboardCard>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}