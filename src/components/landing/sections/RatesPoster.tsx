import Link from "next/link";
import type { PairSnapshot } from "@/lib/landing";
import { formatRate } from "@/lib/rateStats";
import { fmtPct } from "@/lib/moversText";
import Reveal from "../motion/Reveal";

// Kurs ke rupiah diset sebagai poster: kode raksasa di kiri, angka kecil di
// kanan pada baseline yang sama. Tiap baris menuju halaman kurs publiknya.
// `heading` null = halaman sudah punya h1 sendiri (/kurs), daftarnya saja.
type Props = { pairs: PairSnapshot[]; heading?: string | null; framed?: boolean };

export default function RatesPoster({ pairs, heading = "Kurs ke rupiah hari ini", framed = true }: Props) {
  return (
    <section className={framed ? "px-5 py-28 sm:px-10 sm:py-40" : ""}>
      {heading && (
        <Reveal className="mb-12 flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="text-[34px] font-semibold leading-tight tracking-[-0.02em]">{heading}</h2>
          <Link href="/kurs" className="text-[17px] underline underline-offset-4 hover:decoration-transparent">
            Semua kurs populer
          </Link>
        </Reveal>
      )}
      <ul>
        {pairs.map((pair, i) => (
          <li key={pair.code}>
            <Reveal delay={i * 60}>
              <Link
                href={`/kurs/${pair.code.toLowerCase()}-idr`}
                className="group flex flex-col gap-1.5 py-2 sm:flex-row sm:items-baseline sm:justify-between"
              >
                <span className="flex items-baseline gap-4 text-[clamp(64px,10vw,150px)] font-black leading-[0.92] tracking-[-0.04em]">
                  {pair.code}
                  <span
                    aria-hidden
                    className="text-[0.3em] font-semibold opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-2 group-hover:opacity-100"
                  >
                    →
                  </span>
                </span>
                <span className="text-[20px] tabular-nums">
                  Rp{formatRate(pair.rate)}
                  {pair.weekPct !== null && (
                    <span className={pair.weekPct > 0 ? "text-up" : pair.weekPct < 0 ? "text-down" : "text-muted"}>
                      {" "}
                      {fmtPct(pair.weekPct)} seminggu
                    </span>
                  )}
                </span>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
