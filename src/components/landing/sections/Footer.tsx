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

// Foto arsip yang dipakai landing — kredit wajib (CC BY / CC BY-SA).
const credits = [
  {
    title: "Het gebouw van de Javasche Bank te Batavia",
    href: "https://commons.wikimedia.org/w/index.php?curid=104603063",
    license: "CC BY 4.0",
    licenseHref: "https://creativecommons.org/licenses/by/4.0/",
  },
  {
    title: "Kali Besar te Batavia, ter hoogte van de Javasche Bank",
    href: "https://commons.wikimedia.org/w/index.php?curid=105711056",
    license: "CC BY 4.0",
    licenseHref: "https://creativecommons.org/licenses/by/4.0/",
  },
  {
    title: "Biljetten uit de collectie van het Museum van het Bataviaasch Genootschap",
    href: "https://commons.wikimedia.org/wiki/File:KITLV_A679_-_Biljetten_uit_de_collectie_van_het_Museum_van_het_Bataviaasch_Genootschap_voor_Kunsten_en_Wetenschappen_te_Batavia,_KITLV_89072.tiff",
    license: "CC BY 4.0",
    licenseHref: "https://creativecommons.org/licenses/by/4.0/",
  },
  {
    title: "MDDS 06.0005 Oeang 10 Rupiah 01, oleh Museumdaerah.deliserdang",
    href: "https://commons.wikimedia.org/w/index.php?curid=104099493",
    license: "CC BY-SA 4.0",
    licenseHref: "https://creativecommons.org/licenses/by-sa/4.0/",
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
            <h2 className="font-semibold">Foto arsip</h2>
            <ul className="mt-3 space-y-2 text-muted">
              {credits.map((credit) => (
                <li key={credit.href}>
                  <a href={credit.href} className="hover:text-ink">
                    “{credit.title}”
                  </a>
                  ,{" "}
                  <a href={credit.licenseHref} className="hover:text-ink">
                    {credit.license}
                  </a>
                  , via Wikimedia Commons
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
