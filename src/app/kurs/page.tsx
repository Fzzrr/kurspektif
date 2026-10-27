import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Reveal from '@/components/landing/motion/Reveal';
import PublicShell from '@/components/landing/PublicShell';
import RatesPoster from '@/components/landing/sections/RatesPoster';
import { watchlistSnapshot } from '@/lib/watchlist';
import { POPULAR_PAIRS, WORLD_PAIRS } from '@/lib/pairs';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Kurs hari ini — Kurspektif',
  description:
    'Kurs pasangan mata uang utama dunia dan kurs ke rupiah hari ini, beserta perubahan seminggu dan apa yang menggerakkannya.',
};

const dateFormatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
const h2Class = 'text-[34px] font-semibold leading-tight tracking-[-0.02em]';

export default async function KursIndexPage() {
  // Satu panggilan untuk kedua daftar — kursnya diambil dalam dua request total.
  const rows = await watchlistSnapshot([...WORLD_PAIRS, ...POPULAR_PAIRS]).catch(() => []);
  const pick = (pairs: string[]) => rows.filter((row) => pairs.includes(row.pair));
  const date = rows.find((row) => row.date)?.date;
  const loaded = rows.some((row) => row.rate !== null);

  return (
    <PublicShell>
      <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-7">
          <h1 className="text-balance text-[clamp(44px,7vw,104px)] font-black leading-[0.9] tracking-[-0.04em]">
            Kurs hari ini
          </h1>
          <p className="mt-5 max-w-[56ch] text-[17px] leading-relaxed">
            Kurs referensi harian{date && <> per {dateFormatter.format(new Date(date))}</>}, dengan perubahan seminggu
            terakhir. Pilih pasangan untuk melihat grafik setahun dan apa yang menggerakkannya.
          </p>
        </div>
        <Reveal delay={80} className="lg:col-span-4 lg:col-start-9">
          <figure>
            <Image
              src="/arsip/peta-dunia-1700.jpg"
              alt="Peta dunia tahun 1700 dengan dua belahan bumi."
              width={1600}
              height={1173}
              sizes="(min-width: 1024px) 33vw, 100vw"
              priority
              className="archive-photo aspect-[4/3] h-auto w-full object-cover"
            />
            <figcaption className="mt-3 text-[14px] text-muted">
              A New Map of the Terraqueous Globe, Edward Wells dan Michael Burghers, 1700. Domain publik.
            </figcaption>
          </figure>
        </Reveal>
      </div>

      {!loaded ? (
        <p className="mt-16 text-[17px] text-down">Kurs sedang tidak bisa dimuat. Coba lagi beberapa saat lagi.</p>
      ) : (
        <>
          <section className="mt-20 sm:mt-28">
            <h2 className={h2Class}>Pasangan utama dunia</h2>
            <div className="mt-10">
              <RatesPoster rows={pick(WORLD_PAIRS)} heading={null} framed={false} />
            </div>
          </section>
          <section className="mt-24 sm:mt-36">
            <h2 className={h2Class}>Kurs ke rupiah</h2>
            <div className="mt-10">
              <RatesPoster rows={pick(POPULAR_PAIRS)} heading={null} framed={false} />
            </div>
          </section>
        </>
      )}

      <p className="mt-16 text-[15px] text-muted">
        Kurs tengah referensi bank sentral, bukan kurs jual/beli bank atau money changer.{' '}
        <Link href="/metodologi" className="text-ink underline underline-offset-4 hover:decoration-transparent">
          Cara kami menghitung
        </Link>
        .
      </p>
    </PublicShell>
  );
}
