"use client";

// Satu-satunya hal yang bisa "dimainkan" di landing: pilih mata uang, baca
// kurs hari ini dan kalimat penyebab minggu ini — data asli, bukan contoh.
// Tanpa JavaScript tetap tampil (pilihan pertama), tombolnya saja yang diam.
import { useState } from "react";
import Link from "next/link";
import type { PairSnapshot } from "@/lib/landing";
import { formatRate } from "@/lib/rateStats";
import { fmtPct } from "@/lib/moversText";

export default function HeroRates({ pairs }: { pairs: PairSnapshot[] }) {
  const [code, setCode] = useState(pairs[0]?.code);
  const pair = pairs.find((p) => p.code === code) ?? pairs[0];
  if (!pair) return null;

  return (
    <div className="flex flex-col items-start gap-5 sm:items-center">
      <div role="group" aria-label="Pilih mata uang" className="flex flex-wrap gap-1.5 sm:justify-center">
        {pairs.map((p) => (
          <button
            key={p.code}
            type="button"
            onClick={() => setCode(p.code)}
            aria-pressed={p.code === pair.code}
            className={`min-w-14 px-3 py-2 text-[14px] font-medium tabular-nums ${
              p.code === pair.code ? "bg-paper text-ink" : "bg-paper/10 text-paper hover:bg-paper/20"
            }`}
          >
            {p.code}
          </button>
        ))}
      </div>

      <p aria-live="polite" className="max-w-[46ch] text-[20px] leading-snug text-paper sm:text-center">
        <span className="font-semibold tabular-nums">
          1 {pair.code} = Rp{formatRate(pair.rate)}
        </span>
        {pair.weekPct !== null && <span className="tabular-nums"> · {fmtPct(pair.weekPct)} dalam seminggu</span>}
        . {pair.reason}{" "}
        <Link
          href={`/kurs/${pair.code.toLowerCase()}-idr`}
          className="whitespace-nowrap underline decoration-2 underline-offset-4 hover:decoration-transparent"
        >
          Lihat {pair.code}/IDR
        </Link>
      </p>
    </div>
  );
}
