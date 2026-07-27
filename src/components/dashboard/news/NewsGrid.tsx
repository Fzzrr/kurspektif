import NewsCard from './NewsCard';
import type { NewsItem } from '@/lib/mock/news';

type Props = { items: NewsItem[]; totalCount: number };

export default function NewsGrid({ items, totalCount }: Props) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Semua berita ({totalCount})</p>
      <div className="mt-3 grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}