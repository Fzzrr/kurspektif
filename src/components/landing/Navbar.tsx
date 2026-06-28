"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MenuIcon, CloseIcon } from "../ui/icons";

const links = [
  { label: "Fitur", href: "#fitur", id: "fitur" },
  { label: "Cara kerja", href: "#cara", id: "cara" },
  { label: "Pratinjau", href: "#pratinjau", id: "pratinjau" },
];

export default function Navbar() {
  const [progress, setProgress] = useState(0);
  const [elevated, setElevated] = useState(false);
  const [active, setActive] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  // Progress bar + bayangan saat halaman di-scroll.
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? (el.scrollTop / max) * 100 : 0);
      setElevated(el.scrollTop > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scrollspy: tandai menu untuk section yang sedang dilihat.
  useEffect(() => {
    const sections = links
      .map((l) => document.getElementById(l.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Tutup menu mobile saat layar membesar ke breakpoint desktop (md) & saat
  // menekan Escape. Kunci scroll body selama menu terbuka.
  useEffect(() => {
    if (!menuOpen) return;
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => mq.matches && setMenuOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    mq.addEventListener("change", onChange);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      mq.removeEventListener("change", onChange);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-paper/80 backdrop-blur transition-shadow ${
        elevated
          ? "border-line shadow-[0_8px_30px_-18px_rgba(14,31,26,0.45)]"
          : "border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-display text-xl font-bold tracking-tight">
          Kurspektif<span className="text-accent">.</span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-7">
          <div className="hidden items-center gap-7 md:flex">
            {links.map((link) => {
              const isActive = active === link.id;
              return (
                // Anchor sehalaman pakai <a> agar smooth scroll (CSS) tidak
                // ditimpa intersepsi scroll instan milik Next App Router.
                <a
                  key={link.href}
                  href={link.href}
                  className={`relative text-sm transition-colors ${
                    isActive ? "text-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  {link.label}
                  <span
                    aria-hidden
                    className={`absolute -bottom-1.5 left-0 h-0.5 rounded-full bg-accent transition-all duration-300 ${
                      isActive ? "w-full opacity-100" : "w-0 opacity-0"
                    }`}
                  />
                </a>
              );
            })}
          </div>
          <Link
            href="/dashboard"
            className="group hidden items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-sm font-medium text-paper transition-opacity hover:opacity-90 sm:inline-flex"
          >
            Coba sekarang
          </Link>

          {/* Tombol hamburger — hanya tampil di layar kecil */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line text-ink transition-colors hover:border-ink md:hidden"
          >
            {menuOpen ? (
              <CloseIcon className="size-5" />
            ) : (
              <MenuIcon className="size-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Menu navigasi mobile — dropdown di bawah header */}
      <div
        id="mobile-menu"
        className={`overflow-hidden border-t bg-paper/95 backdrop-blur transition-[max-height,opacity] duration-300 ease-out md:hidden ${
          menuOpen
            ? "max-h-80 border-line opacity-100"
            : "max-h-0 border-transparent opacity-0"
        }`}
      >
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-4">
          {links.map((link) => {
            const isActive = active === link.id;
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`rounded-lg px-3 py-3 text-sm transition-colors ${
                  isActive
                    ? "bg-surface text-ink"
                    : "text-muted hover:bg-surface hover:text-ink"
                }`}
              >
                {link.label}
              </a>
            );
          })}
          <Link
            href="/dashboard"
            onClick={() => setMenuOpen(false)}
            className="mt-1 inline-flex items-center justify-center rounded-xl bg-ink px-4 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-90 sm:hidden"
          >
            Coba sekarang
          </Link>
        </nav>
      </div>

      {/* Indikator progress scroll */}
      <span
        aria-hidden
        className="absolute bottom-0 left-0 h-0.5 bg-accent transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </header>
  );
}
