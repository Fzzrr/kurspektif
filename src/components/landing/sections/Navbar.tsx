import Link from "next/link";
import Wordmark from "@/components/ui/Wordmark";

// Bar polos untuk semua halaman publik: wordmark, dua tautan, satu aksi.
// Sengaja tanpa kaca/blur, progress bar, atau menu hamburger — tautannya
// sedikit, jadi muat juga di ponsel.
const links = [
  { label: "Kurs hari ini", href: "/kurs" },
  { label: "Metodologi", href: "/metodologi" },
];

export default function Navbar() {
  return (
    <header className="bg-paper">
      <nav className="flex h-16 items-center justify-between gap-4 px-5 sm:px-10">
        <Link href="/" aria-label="Kurspektif — beranda" className="shrink-0">
          <Wordmark className="h-6 w-auto text-ink" />
        </Link>
        <div className="flex items-center gap-5 text-[14px] sm:gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hidden text-ink/80 underline-offset-[6px] hover:text-ink hover:underline sm:inline"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/login" className="text-ink/80 underline-offset-[6px] hover:text-ink hover:underline">
            Masuk
          </Link>
          <Link href="/register" className="bg-ink px-4 py-2.5 font-medium text-paper hover:bg-muted">
            Daftar gratis
          </Link>
        </div>
      </nav>
    </header>
  );
}
