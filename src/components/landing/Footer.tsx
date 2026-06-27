import Link from "next/link";
import Reveal from "./Reveal";

const columns = [
  {
    title: "Produk",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Pasangan saya", href: "/watchlist" },
      { label: "Alert", href: "/alert" },
    ],
  },
  {
    title: "Tentang",
    links: [
      { label: "Metodologi", href: "/tentang-sentimen" },
      { label: "Sumber data", href: "/tentang-sentimen" },
      { label: "Kontak", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <Reveal className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-wrap justify-between gap-8">
          <div className="max-w-xs">
            <p className="font-display text-xl font-bold tracking-tight">
              Kurspektif<span className="text-accent">.</span>
            </p>
            <p className="mt-2 text-sm text-muted">
              Konteks di balik setiap pergerakan kurs.
            </p>
          </div>

          <div className="flex gap-12">
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-medium">{col.title}</h4>
                <ul className="mt-3 space-y-1.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted transition-colors hover:text-ink"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-line pt-6 text-xs text-muted">
          <span>
            Alat informasi &amp; edukasi, bukan nasihat finansial. Sentimen
            adalah indikasi, bukan vonis.
          </span>
          <span>© 2026 Kurspektif</span>
        </div>
      </Reveal>
    </footer>
  );
}
