import Link from "next/link";
import Wordmark from "@/components/ui/Wordmark";

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

// Gambar arsip yang dipakai landing. Semuanya domain publik (CC0/PD), jadi
// kredit tidak wajib, tapi tetap dicantumkan.
const credits = [
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
  {
    title: "Money changer's box",
    source: "The Metropolitan Museum of Art",
    href: "https://www.metmuseum.org/art/collection/search/199839",
    license: "CC0",
  },
  {
    title: "Geldkist van de Amsterdamse Wisselbank",
    source: "Amsterdam Museum",
    href: "https://commons.wikimedia.org/w/index.php?curid=86835963",
    license: "CC0",
  },
];

export default function Footer({ showCredits = false }: { showCredits?: boolean }) {
  return (
    <footer className="flex min-h-[70svh] flex-col justify-between gap-20 px-5 pb-6 pt-16 sm:px-10">
      <div className="grid grid-cols-2 gap-8 text-[14px] md:grid-cols-12 md:gap-6">
        {columns.map((col) => (
          <div key={col.title} className="md:col-span-2">
            <h2 className="font-semibold">{col.title}</h2>
            <ul className="mt-3 space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-muted hover:text-ink">
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

      <div>
        <Wordmark viewBox="-2 36 620 130" className="h-auto w-full text-ink" />
        <p className="mt-4 flex flex-wrap justify-between gap-2 text-[14px] text-muted">
          <span>Alat informasi dan edukasi, bukan nasihat finansial. Kurs tengah referensi, bukan kurs jual-beli bank.</span>
          <span>© 2026 Kurspektif</span>
        </p>
      </div>
    </footer>
  );
}
