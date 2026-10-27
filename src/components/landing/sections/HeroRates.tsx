"use client";

// Satu-satunya hal yang bisa "dimainkan" di landing: pilih pasangan, baca
// kurs hari ini dan kalimat penyebab minggu ini — data asli, bukan contoh.
// Tanpa JavaScript tetap tampil (pilihan pertama), tombolnya saja yang diam.
import { useState } from "react";
import Link from "next/link";
import type { PairSnapshot } from "@/lib/landing";
import { formatRate } from "@/lib/rateStats";
import { fmtPct } from "@/lib/moversText";
import { pairToSlug } from "@/lib/pairs";

// `initial`: pasangan yang dibuka pertama — yang paling bergerak minggu ini.
export default function HeroRates({ pairs, initial }: { pairs: PairSnapshot[]; initial?: string }) {
  const [selected, setSelected] = useState(initial ?? pairs[0]?.pair);
  const current = pairs.find((p) => p.pair === selected) ?? pairs[0];
  if (!current || current.rate === null) return null;
  const [base, quote] = current.pair.split("/");

  return (
    <div className="flex flex-col items-start gap-5 sm:items-center">
      <div role="group" aria-label="Pilih pasangan mata uang" className="flex flex-wrap gap-1.5 sm:justify-center">
        {pairs.map((p) => (
          <button
            key={p.pair}
            type="button"
            onClick={() => setSelected(p.pair)}
            aria-pressed={p.pair === current.pair}
            className={`px-3 py-2 text-[14px] font-medium tabular-nums ${
              p.pair === current.pair ? "bg-paper text-ink" : "bg-paper/10 text-paper hover:bg-paper/20"
            }`}
          >
            {p.pair}
          </button>
        ))}
      </div>

      <p aria-live="polite" className="max-w-[46ch] text-[20px] leading-snug text-paper sm:text-center">
        <span className="font-semibold tabular-nums">
          1 {base} = {formatRate(current.rate)} {quote}
        </span>
        {current.weekPct !== null && <span className="tabular-nums"> · {fmtPct(current.weekPct)} dalam seminggu</span>}
        . {current.reason}{" "}
        <Link
          href={`/kurs/${pairToSlug(current.pair)}`}
          className="whitespace-nowrap underline decoration-2 underline-offset-4 hover:decoration-transparent"
        >
          Lihat {current.pair}
        </Link>
      </p>
    </div>
  );
}
