import Link from 'next/link';
import DashboardCard from '../ui/DashboardCard';
import SentimentBadge from './SentimentBadge';
import type { NewsItem } from '@/lib/marketaux';
import { formatTimeAgo } from '@/lib/timeAgo';

type Props = {
  item: NewsItem;
  /** Kartu lebar bergambar (mengisi 2 kolom di mosaik). */
  wide?: boolean;
};

export default function NewsCard({ item, wide = false }: Props) {
  return (
    <Link href={item.url} target="_blank" rel="noopener noreferrer" className="group block">
      <DashboardCard className="flex flex-col group-hover:-translate-y-0.5 group-hover:bg-accent-soft">
        {item.image && (
          <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-xl bg-paper">
            <img
              src={item.image}
              alt=""
              className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-paper to-transparent" />
          </div>
        )}

        <div className="flex items-center justify-between">
          <SentimentBadge sentiment={item.sentiment} />
        </div>

        <p
          className={`mt-3 line-clamp-2 font-semibold leading-snug text-ink underline-offset-4 decoration-muted group-hover:underline ${
            wide ? 'text-lg' : 'text-sm'
          }`}
        >
          {item.headline}
        </p>
        <p className="mb-4 mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{item.summary}</p>

        {/* `mt-auto` menempelkan footer ke dasar kartu — tinggi kartu disamakan
            grid, jadi baris sumber/pasangan selalu sejajar antar-kartu. */}
        <div className="mt-auto flex items-center justify-between border-t border-line pt-3 font-mono text-[10px] text-muted">
          <span>{item.source} · {formatTimeAgo(item.publishedAt)}</span>
          {item.pair && <span className="rounded-full bg-accent-soft px-2 py-1 text-accent">{item.pair}</span>}
        </div>
      </DashboardCard>
    </Link>
  );
}
