import NewsCard from './NewsCard';
import type { NewsItem } from '@/lib/mock/news';

type Props = { items: NewsItem[]; totalCount: number };

export default function NewsGrid({ items, totalCount }: Props) {
  // Filter tidak menyisakan apa pun di seluruh halaman.
  if (totalCount === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-line px-4 py-12 text-center text-sm text-muted">
        Tidak ada berita yang cocok. Coba ubah kata kunci atau tekan Reset.
      </p>
    );
  }

  // Ada hasil, tapi semuanya sudah habis tampil di blok headline + "Paling
  // baru" di atas. Jangan render judul section yang isinya kosong.
  if (items.length === 0) return null;

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