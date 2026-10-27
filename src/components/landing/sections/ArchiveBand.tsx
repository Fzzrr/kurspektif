import Image from "next/image";
import Reveal from "../motion/Reveal";

// Jeda di antara section tipografi: peta dunia selebar layar, lalu dua benda
// dari sejarah penukaran uang. Semua dari koleksi terbuka, kreditnya di footer.
const objects = [
  {
    src: "/arsip/kotak-penukar-uang.jpg",
    w: 1932,
    h: 1648,
    alt: "Kotak kayu penukar uang yang terbuka, dengan cekungan untuk timbangan dan anak timbangan.",
    caption: "Kotak penukar uang untuk timbangan koin. Koleksi The Metropolitan Museum of Art.",
  },
  {
    src: "/arsip/peti-wisselbank.jpg",
    w: 1920,
    h: 1443,
    alt: "Peti uang kayu berlapis besi dengan pegangan di sisinya.",
    caption: "Peti uang Wisselbank Amsterdam. Koleksi Amsterdam Museum.",
  },
];

export default function ArchiveBand() {
  return (
    <section className="py-28 sm:py-40">
      <figure>
        <Image
          src="/arsip/peta-dunia-1700.jpg"
          alt="Peta dunia tahun 1700 dengan dua belahan bumi, bertuliskan A New Map of the Terraqueous Globe."
          width={1600}
          height={1173}
          sizes="100vw"
          loading="eager"
          className="archive-photo archive-open aspect-[4/3] h-auto w-full object-cover lg:aspect-auto lg:h-[70svh]"
        />
        <figcaption className="mt-3 px-5 text-[14px] text-muted sm:px-10">
          A New Map of the Terraqueous Globe, Edward Wells dan Michael Burghers, 1700.
        </figcaption>
      </figure>

      <div className="mt-28 grid gap-10 px-5 sm:mt-40 sm:px-10 lg:grid-cols-12 lg:gap-6">
        <Reveal className="lg:col-span-4">
          <h2 className="text-[34px] font-semibold leading-tight tracking-[-0.02em]">Menukar uang sejak dulu</h2>
          <p className="mt-4 text-[17px] leading-relaxed">
            Jauh sebelum ada grafik kurs, penukar uang menimbang koin asing satu per satu. Amsterdam mendirikan
            Wisselbank pada 1609 untuk menertibkan ratusan jenis koin yang beredar di kotanya. Pertanyaannya masih sama:
            berapa nilai uang ini dibanding uang itu, dan kenapa berubah.
          </p>
        </Reveal>
        {objects.map((photo, i) => (
          <Reveal key={photo.src} delay={90 + i * 90} className="lg:col-span-4">
            <figure>
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.w}
                height={photo.h}
                sizes="(min-width: 1024px) 33vw, 100vw"
                className="archive-photo aspect-[4/3] h-auto w-full object-cover"
              />
              <figcaption className="mt-3 text-[14px] text-muted">{photo.caption}</figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
