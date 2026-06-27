import Link from "next/link";

const links = [
  { label: "Fitur", href: "#fitur" },
  { label: "Cara kerja", href: "#cara" },
  { label: "Pratinjau", href: "#pratinjau" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-display text-xl font-bold tracking-tight">
          Kurspektif<span className="text-accent">.</span>
        </Link>

        <div className="flex items-center gap-7">
          <div className="hidden items-center gap-7 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <Link
            href="/dashboard"
            className="rounded-xl bg-ink px-4 py-2 text-sm font-medium text-paper transition-opacity hover:opacity-90"
          >
            Coba sekarang
          </Link>
        </div>
      </nav>
    </header>
  );
}
