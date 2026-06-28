import Link from "next/link";
import RateCard from "./RateCard";
import ScrollCue from "./ScrollCue";
import { ArrowRight } from "../ui/icons";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Dekor: glow emas + grid titik (tidak mengganggu interaksi) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-[-6rem] -z-10 h-80 w-80 rounded-full bg-accent/15 blur-[90px]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hero-grid" />

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 sm:py-20 md:grid-cols-2 md:gap-14">
        {/* Kolom kiri — pesan utama */}
        <div>
          <p className="animate-fade-up flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-accent">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            Monitor kurs & konteks berita
          </p>

          <h1
            className="animate-fade-up mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl"
            style={{ animationDelay: ".08s" }}
          >
            Bukan sekadar angka kurs — tapi{" "}
            <span className="draw-underline text-accent">alasan</span> di baliknya.
          </h1>

          <p
            className="animate-fade-up mt-5 max-w-md text-lg text-muted"
            style={{ animationDelay: ".16s" }}
          >
            Lacak nilai tukar untuk pasangan mata uang apa pun, lalu baca berita
            yang sudah ditandai sentimennya agar kamu paham kenapa kurs bergerak —
            bukan cuma seberapa.
          </p>

          <div
            className="animate-fade-up mt-7 flex flex-wrap gap-3"
            style={{ animationDelay: ".24s" }}
          >
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-3 text-sm font-medium text-paper transition-all hover:opacity-90 hover:shadow-[0_14px_30px_-12px_rgba(14,31,26,0.6)]"
            >
              Coba sekarang
              <ArrowRight className="size-[1.1em] transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <a
              href="#cara"
              className="rounded-xl border border-line px-6 py-3 text-sm font-medium transition-colors hover:border-ink hover:bg-surface"
            >
              Lihat cara kerja
            </a>
          </div>

          <p
            className="animate-fade-up mt-6 font-mono text-xs text-muted"
            style={{ animationDelay: ".32s" }}
          >
            Multi mata uang <span className="text-accent">·</span> Berita lokal &amp;
            global <span className="text-accent">·</span> Gratis
          </p>
        </div>

        {/* Kolom kanan — kartu signature */}
        <div className="animate-fade-up relative" style={{ animationDelay: ".2s" }}>
          <div
            aria-hidden
            className="animate-glow pointer-events-none absolute -inset-5 -z-10 rounded-[2rem] bg-accent/15 blur-2xl"
          />
          <div className="transition-transform duration-300 hover:-translate-y-1.5">
            <RateCard />
          </div>
        </div>
      </div>

      <ScrollCue />
    </section>
  );
}
