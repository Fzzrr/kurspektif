"use client";

// Petunjuk "gulir ke bawah" di hero: chevron memantul lembut yang memudar
// begitu pengguna mulai menggulir. Klik → smooth-scroll ke section pertama.
// Reduced-motion ditangani CSS (.scroll-cue di-nonaktifkan), dan tetap aman
// tanpa JS (default terlihat; hanya disembunyikan setelah scroll).

import { useEffect, useState } from "react";
import { ChevronDown } from "@/components/ui/icons";

export default function ScrollCue() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => setHidden(window.scrollY > 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href="#cara"
      aria-label="Gulir ke bawah untuk melihat selengkapnya"
      className={`fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-1.5 transition-opacity duration-500 ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
        Gulir
      </span>
      <span
        aria-hidden
        className="scroll-cue flex h-9 w-9 items-center justify-center rounded-full border border-line bg-paper/70 text-ink backdrop-blur transition-colors hover:border-ink"
      >
        <ChevronDown className="size-4" />
      </span>
    </a>
  );
}
