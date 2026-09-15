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
            <Link href={item.url} target="_blank" rel="noopener noreferrer" className="group block h-full">
              <DashboardCard className="flex h-full items-center gap-4 group-hover:-translate-y-0.5 group-hover:border-muted/60">
                <div className="min-w-0 flex-1">
                  <span
                    className="inline-block size-1.5 rounded-full"
                    style={{ backgroundColor: SENTIMENT[item.sentiment].color }}
                  />
                  <p className="mt-1 text-sm font-medium leading-snug text-ink underline-offset-4 decoration-muted group-hover:underline">
                    {item.headline}
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-muted">
                    {item.source} · {formatTimeAgo(item.publishedAt)}
                  </p>
                </div>
                {item.image && (
                  <div className="size-16 shrink-0 overflow-hidden rounded-lg border border-line">
                    <img
                      src={item.image}
                      alt=""
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
              </DashboardCard>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}