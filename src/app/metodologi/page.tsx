import Image from 'next/image';
import PublicShell from '@/components/landing/PublicShell';
import MethodologyContent from '@/components/methodology/MethodologyContent';
import { Headlines, Ranking } from '@/components/landing/sections/Reasons';
import { loadLandingData } from '@/lib/landing';

export const revalidate = 3600;

export const metadata = {
  title: 'Metodologi — Kurspektif',
  description: 'Dari mana kurs, sentimen berita, penggerak mingguan, dan alert di Kurspektif dihitung.',
};

// Versi publik menampilkan contoh nyata di samping tiap metode: data minggu
// ini, bukan ilustrasi.
export default async function MetodologiPage() {
  const data = await loadLandingData();
  return (
    <PublicShell>
      <MethodologyContent
        poster
        figures={{
          'sumber-kurs': (
            <figure>
              <Image
                src="/arsip/wisselbank-dam.jpg"
                alt="Ukiran Lapangan Dam di Amsterdam dengan balai kota lama tempat Wisselbank beroperasi."
                width={1920}
                height={1384}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="archive-photo h-auto w-full"
              />
              <figcaption className="mt-3 text-[14px] text-muted">
                Lapangan Dam di Amsterdam, tempat Wisselbank (bank penukaran, berdiri 1609) beroperasi. Cetakan
                koleksi Rijksmuseum, CC0.
              </figcaption>
            </figure>
          ),
          penggerak: data.featured?.movers && <Ranking movers={data.featured.movers} />,
          sentimen: data.news.length > 0 && <Headlines news={data.news} />,
        }}
      />
    </PublicShell>
  );
}
