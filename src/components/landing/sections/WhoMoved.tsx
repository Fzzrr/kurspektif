import type { WeeklyMovers } from "@/lib/movers";
import { explain, fmtPct } from "@/lib/moversText";
import Reveal from "../motion/Reveal";

// Dua angka raksasa berdampingan: kekuatan dolar dan rupiah minggu ini,
// dihitung terhadap mata uang utama. Kalimat di atasnya disusun dari angka
// yang sama, jadi selalu benar untuk minggu apa pun.
const verb = (pct: number, up: string, down: string) => (pct >= 0 ? up : down);

export default function WhoMoved({ movers }: { movers: WeeklyMovers }) {
  const [usd, idr] = movers.sides;
  const abs = (pct: number) => fmtPct(Math.abs(pct)).replace(/^[+−-]/, "").replace(/%$/, "");

  return (
    <section className="px-5 py-28 sm:px-10 sm:py-40">
      <div className="grid gap-6 md:grid-cols-12">
        <Reveal className="md:col-span-5">
          <h2 className="text-[34px] font-semibold leading-tight tracking-[-0.02em]">Naik belum tentu menguat</h2>
        </Reveal>
        <Reveal delay={80} className="md:col-span-6 md:col-start-7">
          <p className="text-[17px] leading-relaxed">
            Minggu ini USD/IDR {verb(movers.pairChangePct, "naik", "turun")} {abs(movers.pairChangePct)}%. Terhadap
            enam mata uang utama, dolar AS {verb(usd.strengthPct, "menguat", "melemah")} {abs(usd.strengthPct)}% dan
            rupiah {verb(idr.strengthPct, "menguat", "melemah")} {abs(idr.strengthPct)}%. {explain(movers)}
          </p>
        </Reveal>
      </div>

      <div className="mt-20 grid gap-12 sm:mt-28 md:grid-cols-2 md:gap-6">
        {[
          { label: "Dolar AS terhadap mata uang utama, 7 hari terakhir", pct: usd.strengthPct },
          { label: "Rupiah terhadap mata uang utama, 7 hari terakhir", pct: idr.strengthPct },
        ].map((side, i) => (
          <Reveal key={side.label} delay={120 + i * 90}>
            <p className="text-[clamp(72px,12.4vw,200px)] font-black leading-[0.8] tracking-[-0.05em] tabular-nums">
              {fmtPct(side.pct)}
            </p>
            <p className="mt-5 text-[17px]">{side.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
