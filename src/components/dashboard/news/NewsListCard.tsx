import Link from 'next/link';
import DashboardCard from '../ui/DashboardCard';
import { SENTIMENT } from '@/lib/sentiment';
import type { NewsItem } from '@/lib/marketaux';
import { formatTimeAgo } from '@/lib/timeAgo';

const PREVIEW_COUNT = 4;

type Props = { related: NewsItem[]; others: NewsItem[]; currency: string };

// Slot yang tidak terisi berita terkait pasangan aktif diisi berita terbaru
// lain. Label pemisah hanya muncul kalau memang ada berita terkait di
// atasnya — kalau tidak ada sama sekali, daftar tampil sebagai berita global
// biasa tanpa label yang menegaskan "tidak ada yang cocok".
export default function NewsListCard({ related, others, currency }: Props) {
  const shownRelated = related.slice(0, PREVIEW_COUNT);
  const filler = others.slice(0, PREVIEW_COUNT - shownRelated.length);

  return (
    <DashboardCard>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Berita terkait</p>
        <Link href={`/dashboard/berita?currency=${currency}`} className="font-mono text-xs text-accent hover:underline">
          Lihat semua
        </Link>
      </div>

      {shownRelated.length === 0 && filler.length === 0 ? (
        <p className="mt-3 text-sm text-muted">Belum ada berita tersedia.</p>
      ) : (
        <ul className="mt-3 divide-y divide-line font-medium">
          {shownRelated.map((item) => (
            <NewsRow key={item.id} item={item} />
          ))}
          {shownRelated.length > 0 && filler.length > 0 && (
            <li className="py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Berita lainnya</li>
          )}
          {filler.map((item) => (
            <NewsRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}

function NewsRow({ item }: { item: NewsItem }) {
  return (
    <li className="flex gap-2.5 py-3 first:pt-0 last:pb-0">
      <span
        className="mt-1.5 inline-block size-2 shrink-0 rounded-full"
        style={{ backgroundColor: SENTIMENT[item.sentiment].color }}
      />
      <Link href={item.url} target="_blank" rel="noopener noreferrer" className="group flex min-w-0 flex-1 items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-snug text-ink underline-offset-4 decoration-muted group-hover:underline">{item.headline}</p>
          <p className="mt-1 font-mono text-[10px] text-muted">
            {item.source} · {formatTimeAgo(item.publishedAt)}
          </p>
        </div>
        {item.image && (
          <div className="size-14 shrink-0 overflow-hidden rounded-lg border border-line">
            <img
              src={item.image}
              alt=""
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
      </Link>
    </li>
  );
}
