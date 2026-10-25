import Image from 'next/image';
import PublicShell from '@/components/landing/PublicShell';
import MethodologyContent from '@/components/methodology/MethodologyContent';
import { Agenda, Headlines, Ranking } from '@/components/landing/sections/Reasons';
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
                src="/arsip/javasche-bank.jpg"
                alt="Foto arsip gedung De Javasche Bank di Batavia."
                width={1920}
                height={1426}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="archive-photo h-auto w-full"
              />
              <figcaption className="mt-3 text-[14px] text-muted">
                Gedung De Javasche Bank di Batavia, bank sirkulasi yang kemudian menjadi Bank Indonesia. Foto arsip
                KITLV, CC BY 4.0.
              </figcaption>
            </figure>
          ),
          penggerak: data.usdIdr && <Ranking movers={data.usdIdr} />,
          sentimen: data.news.length > 0 && <Headlines news={data.news} />,
          agenda: data.agenda.length > 0 && <Agenda events={data.agenda} />,
        }}
      />
    </PublicShell>
  );
}
