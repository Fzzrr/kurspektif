import Link from "next/link";

const columns = [
  {
    title: "Produk",
    links: [
      { label: "Kurs hari ini", href: "/kurs" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Berita", href: "/dashboard/berita" },
      { label: "Alert", href: "/dashboard#alert" },
    ],
  },
  {
    title: "Tentang",
    links: [
      { label: "Metodologi", href: "/metodologi" },
      { label: "Sumber data", href: "/metodologi#sumber-kurs" },
      { label: "Syarat & Ketentuan", href: "/syarat" },
      { label: "Kebijakan Privasi", href: "/privasi" },
    ],
  },
  {
    title: "Akun",
    links: [
      { label: "Masuk", href: "/login" },
      { label: "Daftar gratis", href: "/register" },
    ],
  },
];

// Gambar arsip yang dipakai halaman publik (landing, /kurs, /metodologi, auth).
// Uang kertas Javasche Bank berlisensi CC BY 4.0 (kredit wajib); sisanya domain
// publik (CC0/PD), kreditnya tetap dicantumkan.
const credits = [
  {
    title: "Bankbiljet van de Javasche Bank, ontwerp van Lion Cachet (1935)",
    source: "Nationaal Museum van Wereldculturen via Wikimedia Commons",
    href: "https://commons.wikimedia.org/wiki/File:Collectie_NMvWereldculturen,_TM-6017-4,_Bankbiljet,_%27Bankbiljet_van_de_Javasche_Bank,_ontwerp_van_Lion_Cachet%27,_1935.jpg",
    license: "CC BY 4.0",
  },
  {
    title: "Gezicht op het Oude Stadhuis, de Wisselbank, de Nieuwe Kerk en de Waag op de Dam te Amsterdam",
    source: "Rijksmuseum",
    href: "https://commons.wikimedia.org/w/index.php?curid=85275523",
    license: "CC0",
  },
  {
    title: "A New Map of the Terraqueous Globe (1700), Edward Wells dan Michael Burghers",
    source: "Wikimedia Commons",
    href: "https://commons.wikimedia.org/wiki/File:Antique_World_Map_of_Continents_and_Oceans_1700.png",
    license: "domain publik",
  },
];

// Penutup halaman: nama dibangun dari balok, satu huruf per balok dengan
// tinggi berbeda — seperti batang grafik — lalu tautan di bawahnya.
const LETTERS = [..."Kurspektif"];
const HEIGHTS = [100, 78, 64, 86, 70, 94, 74, 60, 90, 82];

export default function Footer({ showCredits = false }: { showCredits?: boolean }) {
  return (
    <footer data-field className="bg-paper px-5 pb-6 pt-16 text-ink sm:px-10 sm:pt-24">
      <p className="sr-only">Kurspektif</p>
      <div aria-hidden className="flex h-[22svh] items-end gap-1 sm:h-[34svh]">
        {LETTERS.map((letter, i) => (
          <span
            key={i}
            className={`footer-block flex flex-1 items-end justify-center pb-[0.12em] text-[clamp(28px,9.4vw,136px)] font-black leading-none text-paper ${i % 2 ? "bg-muted" : "bg-ink"}`}
            style={{ height: `${HEIGHTS[i]}%`, transitionDelay: `${i * 40}ms` }}
          >
            {letter}
          </span>
        ))}
      </div>

      <div className="mt-14 grid grid-cols-2 gap-8 text-[14px] md:grid-cols-12 md:gap-6">
        {columns.map((col) => (
          <div key={col.title} className="md:col-span-2">
            <h2 className="font-semibold">{col.title}</h2>
            <ul className="mt-3 space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="link-line text-muted hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {showCredits && (
          <div className="col-span-2 md:col-span-5 md:col-start-8">
            <h2 className="font-semibold">Gambar arsip</h2>
            <ul className="mt-3 space-y-2 text-muted">
              {credits.map((credit) => (
                <li key={credit.href}>
                  <a href={credit.href} className="hover:text-ink">
                    “{credit.title}”
                  </a>
                  , {credit.source}, {credit.license}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <p className="mt-16 flex flex-wrap items-center justify-between gap-4 text-[14px] text-muted">
        <span>Alat informasi dan edukasi, bukan nasihat finansial. Kurs tengah referensi, bukan kurs jual-beli bank.</span>
        <span className="flex items-center gap-4">
          © 2026 Kurspektif
          <a href="#" className="press bg-surface px-3 py-2 text-ink hover:bg-accent-soft">
            Ke atas
          </a>
        </span>
      </p>
    </footer>
  );
}
