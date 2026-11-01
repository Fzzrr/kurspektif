"use client";

// Pantauan, alert, gerak tajam, dan ringkasan Senin ditunjukkan lewat hasil
// akhirnya: email yang sampai ke kotak masuk. Kiri, email itu (menempel saat
// digulir); kanan, kontrol yang sama dengan yang ada di aplikasi. Mengubah
// kontrol langsung mengubah email — kurs, perubahan, dan kalimatnya asli.
// Bagian email yang diatur sebuah kontrol dipasang ulang (key) saat kontrol itu
// berubah, jadi terlihat apa yang ikut berubah. Di layar sempit email tidak
// menempel (judul blok tidak boleh lewat di bawahnya).
import { useState, type ReactNode } from "react";
import type { PairSnapshot } from "@/lib/landing";
import type { RatePoint } from "@/lib/frankfurter";
import { fmtPct } from "@/lib/moversText";
import { formatRate } from "@/lib/rateStats";
import { parseThreshold } from "@/lib/alerts";
import { currencyToFlag } from "@/lib/flags";
import { SHARP_MOVE_PCT, newSharpMove } from "@/lib/moves";
import Reveal from "../motion/Reveal";
import { heading, lead } from "../type";

type Direction = "atas" | "bawah";

const tone = (pct: number) => (pct > 0 ? "text-up-deep" : pct < 0 ? "text-down-deep" : "text-paper/60");
const flags = (pair: string) => pair.split("/").map((code) => currencyToFlag(code) ?? "").join("");
// Kontrol di kolom kanan: satu bentuk untuk semua (pilihan menyala putih).
const option =
  "min-h-10 rounded-lg px-3 text-[15px] font-medium tabular-nums aria-checked:bg-paper aria-checked:text-ink aria-pressed:bg-paper aria-pressed:text-ink";

function Spark({ points }: { points: RatePoint[] }) {
  if (points.length < 2) return null;
  const values = points.map((p) => p.rate);
  const min = Math.min(...values);
  const span = Math.max(...values) - min || 1;
  const line = values.map((v, i) => `${(i / (values.length - 1)) * 100},${30 - ((v - min) / span) * 28}`).join(" ");
  return (
    <svg viewBox="0 0 100 31" preserveAspectRatio="none" className="h-8 w-20 shrink-0" aria-hidden>
      <polyline points={line} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export default function InboxDemo({ pairs }: { pairs: PairSnapshot[] }) {
  const usable = pairs.filter((p) => p.rate !== null);
  const [picked, setPicked] = useState(() => usable.slice(0, 3).map((p) => p.pair).reverse());
  const first = usable.find((p) => p.pair === picked[0]) ?? usable[0];
  const [direction, setDirection] = useState<Direction>("atas");
  // Batas awal sedikit di atas kurs hari ini, dibulatkan seperti yang diketik orang.
  const [limit, setLimit] = useState(() => (first?.rate ? formatRate(Number((first.rate * 1.004).toPrecision(3))) : ""));
  const [sharp, setSharp] = useState(true);
  const [email, setEmail] = useState("kamu@email.com");
  if (!first?.rate) return null;

  const rows = picked.map((pair) => usable.find((p) => p.pair === pair)).filter((p) => p !== undefined);
  const threshold = parseThreshold(limit);
  const hit = threshold !== null && (direction === "atas" ? first.rate >= threshold : first.rate <= threshold);
  const top = [...rows].sort((a, b) => Math.abs(b.weekPct ?? 0) - Math.abs(a.weekPct ?? 0))[0];
  const sharpRows = rows.flatMap((row) => {
    const move = newSharpMove(row.series, null);
    return move ? [{ pair: row.pair, pct: move.pct }] : [];
  });

  function toggle(pair: string) {
    setPicked((current) =>
      current.includes(pair) ? (current.length > 1 ? current.filter((p) => p !== pair) : current) : [...current, pair],
    );
  }

  return (
    <section id="pantauan" data-field className="scroll-mt-16 grid grid-cols-[minmax(0,1fr)] bg-ink text-paper lg:grid-cols-2">
      {/* Kiri: bidang gelap tempat email menempel (layar lebar). */}
      <div className="flex justify-center bg-accent-soft px-5 pb-12 pt-16 lg:sticky lg:top-16 lg:h-[calc(100svh-4rem)] lg:items-center lg:py-0">
        <div className="relative w-full max-w-[460px]">
          {/* Email sebelumnya di kotak masuk, mengintip di belakang. */}
          <div aria-hidden className="absolute inset-x-8 -top-5 h-12 rounded-2xl bg-ink/25" />
          <div aria-hidden className="absolute inset-x-4 -top-2.5 h-12 rounded-2xl bg-ink/55" />

          <article data-ui aria-label="Pratinjau email dari Kurspektif" className="relative overflow-hidden rounded-2xl bg-ink text-[14px] text-paper">
            <header className="flex items-center gap-3 bg-paper/5 px-5 py-4">
              <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-full bg-paper text-[15px] font-black text-ink">
                K
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex justify-between gap-3">
                  <span className="font-semibold">Kurspektif</span>
                  <span className="text-[13px] text-paper/60">Sen 07.00</span>
                </p>
                <p key={email} className="swap-in truncate text-[13px] text-paper/60">
                  ke {email || "—"}
                </p>
              </div>
            </header>

            <div className="p-5">
              <p className="text-[20px] font-semibold leading-snug">Ringkasan Pantauan minggu ini</p>
              {top?.weekPct != null && (
                <p className="mt-1 text-[13px] text-paper/60">
                  {top.pair} bergerak paling jauh: {fmtPct(top.weekPct)} dalam 7 hari.
                </p>
              )}

              <ul key={picked.join()} className="swap-in mt-5 space-y-4">
                {rows.map((row) => (
                  <li key={row.pair} className="flex items-center gap-3">
                    <span aria-hidden className="shrink-0 whitespace-nowrap text-[15px] leading-none">
                      {flags(row.pair)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex justify-between gap-3 tabular-nums">
                        <span className="font-semibold">{row.pair}</span>
                        {row.weekPct !== null && <span className={`font-semibold ${tone(row.weekPct)}`}>{fmtPct(row.weekPct)}</span>}
                      </p>
                      <p className="mt-0.5 truncate text-[13px] text-paper/60">
                        {formatRate(row.rate ?? 0)} · {row.reason ?? "Data minggu ini belum cukup."}
                      </p>
                    </div>
                    <span className={row.weekPct === null ? "text-paper/60" : tone(row.weekPct)}>
                      <Spark points={row.series} />
                    </span>
                  </li>
                ))}
              </ul>

              {threshold !== null && (
                <p key={`${direction}${threshold}`} className="swap-in mt-5 flex items-start gap-2.5 rounded-lg bg-paper/5 p-3 leading-snug">
                  <span className={`shrink-0 rounded px-1.5 py-0.5 text-[12px] font-semibold ${hit ? "bg-up-deep text-ink" : "bg-paper text-ink"}`}>
                    {hit ? "Tercapai" : "Alert"}
                  </span>
                  <span>
                    {first.pair} di {direction} {formatRate(threshold)}:{" "}
                    {hit ? "tersentuh hari ini." : `belum, kurs hari ini ${formatRate(first.rate)}.`}
                  </span>
                </p>
              )}
              {sharp && (
                <p key={sharpRows.length} className="swap-in mt-3 text-[13px] text-paper/60">
                  {sharpRows.length > 0
                    ? `Bergerak ≥ ${SHARP_MOVE_PCT}% kemarin: ${sharpRows.map((r) => `${r.pair} ${fmtPct(r.pct)}`).join(", ")}.`
                    : `Tidak ada pasanganmu yang bergerak ≥ ${SHARP_MOVE_PCT}% kemarin.`}
                </p>
              )}
              <p className="mt-5 text-[12px] text-paper/60 underline">Berhenti berlangganan</p>
            </div>
          </article>
        </div>
      </div>

      {/* Kanan: kontrol, satu per kemampuan. */}
      <div className="px-5 pb-28 pt-16 sm:px-10 lg:pb-40 lg:pt-[72px]">
        <Reveal>
          <h2 className={heading}>Kurs yang datang sendiri</h2>
        </Reveal>

        <Block title="Simpan pasangan yang kamu pantau." text="Sampai delapan pasangan di Pantauan, tiap pasangan dengan grafik dan penggeraknya.">
          <div role="group" aria-label="Pasangan di Pantauan" className="flex flex-wrap gap-2">
            {usable.map((p) => (
              <button
                key={p.pair}
                type="button"
                aria-pressed={picked.includes(p.pair)}
                onClick={() => toggle(p.pair)}
                className={`${option} flex items-center gap-2 aria-[pressed=false]:bg-paper/5 aria-[pressed=false]:hover:bg-paper/10`}
              >
                <span aria-hidden>{flags(p.pair)}</span>
                {p.pair}
              </button>
            ))}
          </div>
        </Block>

        <Block title="Pasang batas, kami yang menunggu." text="Alert dicek tiap pagi pukul 08.00 WIB. Begitu kurs melewati batasmu, email terkirim.">
          <div className="flex flex-wrap items-stretch gap-2">
            <div role="radiogroup" aria-label={`Arah alert ${first.pair}`} className="flex gap-1 rounded-xl bg-paper/5 p-1">
              {(["atas", "bawah"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  role="radio"
                  aria-checked={direction === d}
                  onClick={() => setDirection(d)}
                  className={`${option} px-4 aria-[checked=false]:hover:bg-paper/10`}
                >
                  Di {d}
                </button>
              ))}
            </div>
            <label className="flex min-h-12 items-center gap-2 rounded-xl bg-paper/5 px-4 text-[15px] focus-within:ring-2 focus-within:ring-paper/40">
              <span aria-hidden>{flags(first.pair)}</span>
              <span className="text-paper/60">{first.pair}</span>
              <input
                value={limit}
                onChange={(event) => setLimit(event.target.value)}
                inputMode="decimal"
                className="w-28 bg-transparent font-semibold tabular-nums outline-none"
              />
            </label>
          </div>
        </Block>

        <Block
          title="Kabar saat bergerak tajam."
          text={`Kalau pasangan di Pantauanmu bergerak ${SHARP_MOVE_PCT}% atau lebih dalam sehari, kamu dikabari pagi itu juga.`}
        >
          <button
            type="button"
            role="switch"
            aria-checked={sharp}
            onClick={() => setSharp(!sharp)}
            className="flex min-h-11 items-center gap-3 text-[15px]"
          >
            <span aria-hidden className={`flex h-7 w-12 items-center rounded-full p-1 transition-colors ${sharp ? "bg-paper" : "bg-paper/15"}`}>
              <span className={`size-5 rounded-full bg-ink transition-[translate] duration-200 ease-snap ${sharp ? "translate-x-5" : ""}`} />
            </span>
            Kabar gerak tajam {sharp ? "aktif" : "mati"}
          </button>
        </Block>

        <Block title="Ringkasan tiap Senin pagi." text="Pukul 07.00 WIB: kurs, perubahan seminggu, dan sisi yang menggerakkannya, untuk tiap pasangan.">
          <label className="flex min-h-12 max-w-sm items-center gap-3 rounded-xl bg-paper/5 px-4 text-[15px] focus-within:ring-2 focus-within:ring-paper/40">
            <span className="text-paper/60">Kirim ke</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="min-w-0 flex-1 bg-transparent outline-none"
            />
          </label>
        </Block>
      </div>
    </section>
  );
}

function Block({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <Reveal className="mt-16 max-w-[46ch] lg:mt-28">
      <p className={`${lead} font-semibold`}>{title}</p>
      <p className="mt-3 text-[17px] leading-relaxed">{text}</p>
      <div data-ui className="mt-6">
        {children}
      </div>
    </Reveal>
  );
}
