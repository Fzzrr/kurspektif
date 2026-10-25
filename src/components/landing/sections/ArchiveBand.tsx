import Image from "next/image";
import Reveal from "../motion/Reveal";

// Jeda di antara section tipografi: foto arsip selebar layar, lalu dua uang
// kertas dari kota yang sama. Semua dari koleksi terbuka, kreditnya di footer.
export default function ArchiveBand() {
  return (
    <section className="py-28 sm:py-40">
      <figure>
        <Image
            src="/arsip/kali-besar.jpg"
            alt="Foto arsip Kali Besar di Batavia: kanal lebar dengan perahu, deretan gudang beratap genteng di tepinya."
            width={1920}
            height={1491}
            sizes="100vw"
            loading="eager"
            className="archive-photo archive-open aspect-[4/3] h-auto w-full object-cover lg:aspect-auto lg:h-[70svh]"
          />
        <figcaption className="mt-3 px-5 text-[14px] text-muted sm:px-10">
          Kali Besar, Batavia, di sekitar gedung De Javasche Bank. Foto arsip KITLV.
        </figcaption>
      </figure>

      <div className="mt-28 grid gap-10 px-5 sm:mt-40 sm:px-10 lg:grid-cols-12 lg:gap-6">
        <Reveal className="lg:col-span-4">
          <h2 className="text-[34px] font-semibold leading-tight tracking-[-0.02em]">Uang di kota yang sama</h2>
          <p className="mt-4 text-[17px] leading-relaxed">
            Uang kertas Batavia bertanggal 1799 dan 1810, dan Oeang Republik Indonesia sepuluh rupiah yang dicetak
            di Djakarta. Nilai tukarnya selalu punya cerita.
          </p>
        </Reveal>
        {[
          {
            src: "/arsip/biljetten-batavia.jpg",
            w: 1920,
            h: 1414,
            alt: "Tiga lembar uang kertas Batavia, bertanggal 1799 dan 1810, dengan cap dan tanda tangan.",
            caption: "Uang kertas Batavia, koleksi Museum Bataviaasch Genootschap. Foto arsip KITLV.",
          },
          {
            src: "/arsip/ori-10-rupiah.jpg",
            w: 1920,
            h: 1440,
            alt: "Uang kertas Oeang Republik Indonesia sepuluh rupiah yang lusuh, dengan potret dan tulisan Sepuluh Rupiah.",
            caption: "Oeang Republik Indonesia, 10 rupiah. Koleksi Museum Daerah Deli Serdang.",
          },
        ].map((photo, i) => (
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
