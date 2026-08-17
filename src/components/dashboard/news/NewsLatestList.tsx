import DashboardCard from '../ui/DashboardCard';
import { SENTIMENT } from '@/lib/sentiment';
import type { NewsItem } from '@/lib/mock/news';

type Props = { items: NewsItem[] };

export default function NewsLatestList({ items }: Props) {
  return (
    <section className="flex h-full flex-col">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Paling baru</p>
      <ul className="mt-3 flex flex-1 flex-col gap-3">
        {items.map((item) => (
          <li key={item.id} className="flex-1">
            <DashboardCard className="flex h-full flex-col justify-center">
              <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-muted">
                <span
                  className="inline-block size-1.5 rounded-full"
                  style={{ backgroundColor: SENTIMENT[item.sentiment].color }}
                />
                {item.region} · {item.category}
              </p>
              <p className="mt-1 text-sm font-medium leading-snug text-ink">{item.headline}</p>
              <p className="mt-1 font-mono text-[10px] text-muted">
                {item.source} · {item.timeAgo}
              </p>
            </DashboardCard>
          </li>
        ))}
      </ul>
    </section>
  );
}