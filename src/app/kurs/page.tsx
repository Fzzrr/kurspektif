import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Reveal from '@/components/landing/motion/Reveal';
import PublicShell from '@/components/landing/PublicShell';
import RatesPoster from '@/components/landing/sections/RatesPoster';
import { loadPairs } from '@/lib/landing';
import { POPULAR_BASES } from '@/lib/pairs';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Kurs rupiah hari ini — Kurspektif',
  description:
    'Kurs dolar, ringgit, riyal, yen, dan mata uang lain ke rupiah hari ini, beserta perubahannya dan apa yang menggerakkannya.',
};

const dateFormatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

export default async function KursIndexPage() {
  const { pairs } = await loadPairs(POPULAR_BASES).catch(() => ({ pairs: [] }));
  const date = pairs[0]?.date;

  return (
    <PublicShell>
      <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-7">
          <h1 className="text-balance text-[clamp(44px,7vw,104px)] font-black leading-[0.9] tracking-[-0.04em]">
            Kurs rupiah hari ini
          </h1>
          <p className="mt-5 max-w-[56ch] text-[17px] leading-relaxed">
            Kurs referensi harian{date && <> per {dateFormatter.format(new Date(date))}</>}, dengan perubahan seminggu
            terakhir. Pilih mata uang untuk melihat grafik setahun dan apa yang menggerakkannya.
          </p>
        </div>
        <Reveal delay={80} className="lg:col-span-4 lg:col-start-9">
          <figure>
            <Image
              src="/arsip/ori-10-rupiah.jpg"
              alt="Uang kertas Oeang Republik Indonesia sepuluh rupiah yang lusuh."
              width={1920}
              height={1440}
              sizes="(min-width: 1024px) 33vw, 100vw"
              priority
              className="archive-photo aspect-[4/3] h-auto w-full object-cover"
            />
            <figcaption className="mt-3 text-[14px] text-muted">
              Oeang Republik Indonesia, 10 rupiah. Koleksi Museum Daerah Deli Serdang,{' '}
              <a href="https://commons.wikimedia.org/w/index.php?curid=104099493" className="underline underline-offset-2">
                Wikimedia Commons
              </a>
              , CC BY-SA 4.0.
            </figcaption>
          </figure>
        </Reveal>
      </div>

      <div className="mt-16 sm:mt-24">
        {pairs.length === 0 ? (
          <p className="text-[17px] text-down">Kurs sedang tidak bisa dimuat. Coba lagi beberapa saat lagi.</p>
        ) : (
          <RatesPoster pairs={pairs} heading={null} framed={false} />
        )}
      </div>

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
