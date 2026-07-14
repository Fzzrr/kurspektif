import RateCard from "../rate/RateCard";
import ScrollCue from "../visuals/ScrollCue";
import Coin from "../visuals/Coin";
import Tilt from "../motion/Tilt";
import CtaLink from "../ui/CtaLink";
import { PulseDot } from "../ui/decor";

// Koin emas yang melayang di sekitar kartu hero. `rotate` diterapkan pada
// elemen dalam sementara animasi float menggerakkan elemen luar — jadi rotate
// & translateY tidak saling menimpa transform. Delay negatif membuat tiap koin
// mulai di fase berbeda, sehingga tidak mengambang serempak.
const floatingCoins = [
  { glyph: "$", code: "USD", rotate: -14, delay: -0.6, duration: 6.5, position: "-right-6 -top-12 z-20 w-16 sm:w-[4.75rem]" },
  { glyph: "€", code: "EUR", rotate: 11, delay: -2.4, duration: 7.5, position: "-left-7 top-12 z-20 w-12 sm:w-14" },
  { glyph: "¥", rotate: -9, delay: -1.3, duration: 6.8, position: "-bottom-8 left-12 z-20 w-12 sm:w-16" },
  { glyph: "£", rotate: 17, delay: -3.2, duration: 8, position: "-right-8 bottom-16 -z-10 hidden w-12 sm:block" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Dekor: glow emas + grid titik (tidak mengganggu interaksi) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-[-6rem] -z-10 h-80 w-80 rounded-full bg-accent/15 blur-[90px]"
      />
      <div aria-hidden className="hero-grid pointer-events-none absolute inset-0 -z-10" />

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 sm:py-20 md:grid-cols-2 md:gap-14">
        {/* Kolom kiri — pesan utama */}
        <div>
          <p className="animate-fade-up flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-accent">
            <PulseDot />
            Monitor kurs &amp; konteks berita
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
            <CtaLink href="/dashboard">Coba sekarang</CtaLink>
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
            {/* {" "} wajib: spasi di ujung baris akan dipangkas JSX. */}
            Multi mata uang <span className="text-accent">·</span>{" "}
            Berita lokal &amp; global <span className="text-accent">·</span> Gratis
          </p>
        </div>

        {/* Kolom kanan — kartu signature dikelilingi koin emas melayang */}
        <div className="animate-fade-up relative" style={{ animationDelay: ".2s" }}>
          <div
            aria-hidden
            className="animate-glow pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-accent/15 blur-2xl"
          />

          {floatingCoins.map((coin) => (
            <div
              key={coin.code ?? coin.glyph}
              aria-hidden
              className={`coin-float pointer-events-none absolute ${coin.position}`}
              style={{
                animationDelay: `${coin.delay}s`,
                animationDuration: `${coin.duration}s`,
              }}
            >
              <div
                style={{ transform: `rotate(${coin.rotate}deg)` }}
                className="drop-shadow-[0_12px_22px_rgba(184,144,42,0.35)]"
              >
                <Coin glyph={coin.glyph} code={coin.code} />
              </div>
            </div>
          ))}

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
