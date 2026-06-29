import Link from "next/link";
import RateCard from "../rate/RateCard";
import ScrollCue from "../visuals/ScrollCue";
import Coin from "../visuals/Coin";
import Tilt from "../motion/Tilt";
import { ArrowRight } from "@/components/ui/icons";

// Koin emas yang melayang di sekitar kartu hero. `rotate` memberi tiap koin
// kemiringan tetap (di elemen dalam) sementara animasi float menggerakkan
// elemen luar — jadi rotate & translateY tidak saling menimpa transform.
function FloatingCoin({
  glyph,
  code,
  className,
  rotate = 0,
  delay = 0,
  duration = 6,
}: {
  glyph: string;
  code?: string;
  className: string;
  rotate?: number;
  delay?: number;
  duration?: number;
}) {
  return (
    <div
      aria-hidden
      className={`coin-float pointer-events-none absolute ${className}`}
      style={{ animationDelay: `${delay}s`, animationDuration: `${duration}s` }}
    >
      <div
        style={{ transform: `rotate(${rotate}deg)` }}
        className="drop-shadow-[0_12px_22px_rgba(184,144,42,0.35)]"
      >
        <Coin glyph={glyph} code={code} />
      </div>
    </div>
  );
}

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
            Multi mata uang <span className="text-accent">·</span> {" "}Berita lokal &amp;
            global <span className="text-accent">·</span> Gratis
          </p>
        </div>

        {/* Kolom kanan — kartu signature dikelilingi koin emas melayang */}
        <div className="animate-fade-up relative" style={{ animationDelay: ".2s" }}>
          <div
            aria-hidden
            className="animate-glow pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-accent/15 blur-2xl"
          />

          {/* Motif uang: koin melayang di tepi kartu (di belakang & di depan). */}
          <FloatingCoin
            glyph="$"
            code="USD"
            rotate={-14}
            delay={-0.6}
            duration={6.5}
            className="-right-6 -top-12 z-20 w-16 sm:w-[4.75rem]"
          />
          <FloatingCoin
            glyph="€"
            code="EUR"
            rotate={11}
            delay={-2.4}
            duration={7.5}
            className="-left-7 top-12 z-20 w-12 sm:w-14"
          />
          <FloatingCoin
            glyph="¥"
            rotate={-9}
            delay={-1.3}
            duration={6.8}
            className="-bottom-8 left-12 z-20 w-12 sm:w-16"
          />
          <FloatingCoin
            glyph="£"
            rotate={17}
            delay={-3.2}
            duration={8}
            className="-right-8 bottom-16 -z-10 hidden w-12 sm:block"
          />

          {/* Kartu — miring 3D mengikuti kursor (mati di sentuh/reduced motion). */}
          <Tilt className="rounded-2xl">
            <RateCard />
          </Tilt>
        </div>
      </div>

      <ScrollCue />
    </section>
  );
}
