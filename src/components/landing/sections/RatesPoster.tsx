import Link from "next/link";
import { formatRate } from "@/lib/rateStats";
import { fmtPct } from "@/lib/moversText";
import { pairToSlug } from "@/lib/pairs";
import Reveal from "../motion/Reveal";

// Kurs diset sebagai poster: pasangan raksasa di kiri, angka kecil di kanan
// pada baseline yang sama. Tiap baris menuju halaman kurs publiknya.
export type RateRow = { pair: string; rate: number | null; weekPct: number | null };

// `heading` null = halaman sudah punya h1 sendiri (/kurs), daftarnya saja.
type Props = { rows: RateRow[]; heading?: string | null; framed?: boolean };

export default function RatesPoster({ rows, heading = "Kurs utama hari ini", framed = true }: Props) {
  return (
    <section className={framed ? "px-5 py-28 sm:px-10 sm:py-40" : ""}>
      {heading && (
        <Reveal className="mb-12 flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="text-[34px] font-semibold leading-tight tracking-[-0.02em]">{heading}</h2>
          <Link href="/kurs" className="text-[17px] underline underline-offset-4 hover:decoration-transparent">
            Semua kurs
          </Link>
        </Reveal>
      )}
      <ul>
        {rows
          .filter((row) => row.rate !== null)
          .map((row, i) => (
            <li key={row.pair}>
              <Reveal delay={i * 60}>
                <Link
                  href={`/kurs/${pairToSlug(row.pair)}`}
                  className="group flex flex-col gap-1.5 py-2 sm:flex-row sm:items-baseline sm:justify-between"
                >
                  <span className="flex items-baseline gap-4 text-[clamp(52px,9vw,140px)] font-black leading-[0.92] tracking-[-0.04em]">
                    {row.pair}
                    <span
                      aria-hidden
                      className="text-[0.3em] font-semibold opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-2 group-hover:opacity-100"
                    >
                      →
                    </span>
                  </span>
                  <span className="text-[20px] tabular-nums">
                    {formatRate(row.rate!)} {row.pair.split("/")[1]}
                    {row.weekPct !== null && (
                      <span className={row.weekPct > 0 ? "text-up" : row.weekPct < 0 ? "text-down" : "text-muted"}>
                        {" "}
                        {fmtPct(row.weekPct)} seminggu
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
