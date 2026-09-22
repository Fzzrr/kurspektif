import DashboardCard from '../ui/DashboardCard';
import NewsCard from './NewsCard';
import { NewsRow } from './NewsListCard';
import type { NewsItem } from '@/lib/marketaux';

type Props = { label: string; items: NewsItem[] };

// Satu hari = satu mosaik: artikel bergambar pertama jadi kartu lebar (2 kolom),
// bergambar lainnya kartu ringkas, dan yang tanpa gambar dikumpulkan sebagai
// daftar baris di akhir. Variasi antar-hari muncul dari komposisi artikelnya
// sendiri — tidak ada styling khusus per kelompok.
export default function NewsDayGroup({ label, items }: Props) {
  const withImage = items.filter((item) => item.image);
  const withoutImage = items.filter((item) => !item.image);
  const [wide, ...compact] = withImage;

  return (
    <section>
      <div className="flex items-baseline justify-between border-b border-line pb-2">
        <h2 className="text-sm font-medium">{label}</h2>
        <span className="font-mono text-xs text-muted">{items.length} berita</span>
      </div>

      {/* `items-start`: kartu lebar (gambar besar) jauh lebih tinggi dari
          kartu ringkas di sebelahnya — tanpa ini, grid meregangkan kartu
          ringkas mengikuti tinggi kartu lebar dan menyisakan ruang kosong
          sebelum footer. Tiap kartu jadi setinggi kontennya sendiri. */}
      <div className="mt-4 grid items-start gap-4 md:grid-cols-3">
        {wide && (
          <div className="md:col-span-2">
            <NewsCard item={wide} wide />
          </div>
        )}
        {compact.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
        {withoutImage.length > 0 && (
          <DashboardCard className="md:col-span-3">
            <ul className="divide-y divide-line">
              {withoutImage.map((item) => (
                <NewsRow key={item.id} item={item} />
              ))}
            </ul>
          </DashboardCard>
        )}
      </div>
    </section>
  );
}
