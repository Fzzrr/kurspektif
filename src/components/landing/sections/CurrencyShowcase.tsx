import Coin from "../visuals/Coin";
import CountUp from "../motion/CountUp";
import Reveal from "../motion/Reveal";
import SectionHeading from "../ui/SectionHeading";
import { SymbolBackdrop } from "../ui/decor";

// Sorotan multi-currency: deretan koin emas melayang di atas tipografi simbol
// mata uang raksasa (outline) sebagai latar editorial, lalu tiga statistik
// produk yang "berhitung naik". Menegaskan USP "pasangan apa pun" secara visual.

// Contoh mata uang — glyph + kode. Kode-lah yang membedakan saat simbol sama
// (¥ untuk JPY & CNY, $ untuk USD & SGD).
const coins = [
  { glyph: "$", code: "USD" },
  { glyph: "€", code: "EUR" },
  { glyph: "£", code: "GBP" },
  { glyph: "¥", code: "JPY" },
  { glyph: "¥", code: "CNY" },
  { glyph: "₹", code: "INR" },
  { glyph: "₩", code: "KRW" },
  { glyph: "$", code: "SGD" },
];

const stats = [
  { value: "8", suffix: "+", label: "pasangan mata uang populer siap pakai" },
  { value: "90", label: "hari konteks historis di tiap kurs" },
  { value: "2", label: "sumber data terpadu: kurs & berita" },
];

export default function CurrencyShowcase() {
  return (
    <section className="relative overflow-hidden border-y border-line bg-surface">
      <SymbolBackdrop className="text-stroke text-[30vw] opacity-70" />

      <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-20">
        <Reveal>
          <SectionHeading
            align="center"
            size="lg"
            eyebrow="Multi-currency"
            title="Satu alat untuk semua mata uang"
            lead="USD, EUR, JPY, hingga pasangan yang jarang dilirik — selama ada kursnya, Kurspektif menyandingkannya dengan berita yang relevan."
          />
        </Reveal>

        {/* Deretan koin melayang — fase & tempo tiap koin sengaja dibedakan
            agar tidak bergerak serempak seperti satu blok. */}
        <Reveal delay={80}>
          <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-8 sm:gap-x-9">
            {coins.map((coin, i) => (
              <li
                key={coin.code}
                className="coin-float w-12 drop-shadow-[0_12px_22px_rgba(184,144,42,0.3)] sm:w-16"
                style={{
                  animationDelay: `${-i * 0.55}s`,
                  animationDuration: `${6 + (i % 3)}s`,
                }}
              >
                <Coin glyph={coin.glyph} code={coin.code} />
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Statistik produk yang berhitung naik */}
        <Reveal delay={140}>
          <dl className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-surface p-6 text-center">
                <dt className="font-display text-4xl font-bold tracking-tight text-ink">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </dt>
                <dd className="mx-auto mt-2 max-w-[16rem] text-sm text-muted">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
