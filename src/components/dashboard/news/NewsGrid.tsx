import NewsDayGroup from './NewsDayGroup';
import type { NewsItem } from '@/lib/marketaux';
import { dayLabel } from '@/lib/timeAgo';

type Props = {
  /** Kelompok [kunci hari, artikel] urut terbaru → terlama. */
  groups: [string, NewsItem[]][];
  totalCount: number;
  remaining: number;
  onLoadMore: () => void;
};

export default function NewsGrid({ groups, totalCount, remaining, onLoadMore }: Props) {
  // Filter tidak menyisakan apa pun di seluruh halaman.
  if (totalCount === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-line px-4 py-12 text-center text-sm text-muted">
        Tidak ada berita yang cocok. Coba ubah kata kunci atau filter.
      </p>
    );
  }

  // Ada hasil, tapi semuanya sudah habis tampil di blok headline + "Paling
  // baru" di atas. Jangan render judul section yang isinya kosong.
  if (groups.length === 0) return null;

  return (
    <div className="space-y-8">
      {groups.map(([key, items]) => (
        <NewsDayGroup key={key} label={dayLabel(key)} items={items} />
      ))}

      {remaining > 0 && (
        <button
          type="button"
          onClick={onLoadMore}
          className="w-full rounded-full py-2.5 font-mono text-sm text-muted hover:bg-accent-soft hover:text-ink"
        >
          Lebih Banyak
        </button>
      )}
    </div>
  );
}
