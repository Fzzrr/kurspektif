import Coin from "../visuals/Coin";
import CountUp from "../motion/CountUp";
import Reveal from "../motion/Reveal";

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
  { value: "90", suffix: "", label: "hari konteks historis di tiap kurs" },
  { value: "2", suffix: "", label: "sumber data terpadu: kurs & berita" },
];

export default function CurrencyShowcase() {
  return (
    <section className="relative overflow-hidden border-y border-line bg-surface">
      {/* Latar tipografi raksasa: simbol mata uang ber-outline yang hanyut. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
      >
        <span className="animate-drift text-stroke select-none whitespace-nowrap font-display text-[30vw] font-bold leading-none opacity-70">
          $ € ¥ £
        </span>
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-20">
        <Reveal className="text-center">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
            Multi-currency
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Satu alat untuk semua mata uang
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted">
            USD, EUR, JPY, hingga pasangan yang jarang dilirik — selama ada
            kursnya, Kurspektif menyandingkannya dengan berita yang relevan.
          </p>
        </Reveal>

        {/* Deretan koin melayang */}
        <Reveal delay={80}>
          <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-8 sm:gap-x-9">
            {coins.map((c, i) => (
              <li
                key={c.code}
                className="coin-float w-12 drop-shadow-[0_12px_22px_rgba(184,144,42,0.3)] sm:w-16"
                style={{
                  animationDelay: `${-i * 0.55}s`,
                  animationDuration: `${6 + (i % 3)}s`,
                }}
              >
                <Coin glyph={c.glyph} code={c.code} />
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Statistik produk yang berhitung naik */}
        <Reveal delay={140}>
          <dl className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="bg-surface p-6 text-center">
                <dt className="font-display text-4xl font-bold tracking-tight text-ink">
                  <CountUp value={s.value} suffix={s.suffix} />
                </dt>
                <dd className="mx-auto mt-2 max-w-[16rem] text-sm text-muted">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
