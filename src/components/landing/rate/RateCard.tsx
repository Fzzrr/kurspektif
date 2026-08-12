import RateLineChart, { type ChartPoint } from "./RateLineChart";
import { SENTIMENT } from "@/lib/sentiment";
import CountUp from "../motion/CountUp";

// Kartu "signature" — elemen visual khas Kurspektif.
// Menampilkan kurs, perubahan, badge posisi historis, grafik, dan legenda.
// Semua prop punya default (USD → IDR) agar pemakaian hero tetap <RateCard />.

// Legenda diturunkan dari SENTIMENT (sumber tunggal warna+label) agar tak drift.
const legend = Object.values(SENTIMENT);

type RateCardProps = {
  pair?: string;
  rate?: string;
  changePercent?: string;
  changeDir?: "up" | "down";
  historical?: string;
  data?: ChartPoint[];
  className?: string;
};

export default function RateCard({
  pair = "USD → IDR",
  rate = "16.234",
  changePercent = "0,8%",
  changeDir = "up",
  historical = "Lebih tinggi dari 82% (90 hari terakhir)",
  data,
  className = "",
}: RateCardProps) {
  const isUp = changeDir === "up";

  return (
    <div
      className={`rounded-2xl border border-line bg-surface p-5 text-ink shadow-[0_18px_40px_-28px_rgba(14,31,26,0.5)] ${className}`}
    >
      {/* Header: pasangan kurs + badge live */}
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-muted">{pair}</p>
        <span className="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-muted">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-up" />
          Live
        </span>
      </div>

      {/* Angka utama + perubahan */}
      <p className="mt-3 font-mono text-3xl font-medium tracking-tight">
        <CountUp value={rate} />
      </p>
      <p className={`font-mono text-sm ${isUp ? "text-up" : "text-down"}`}>
        {isUp ? "↑" : "↓"} {changePercent} hari ini
      </p>

      {/* Posisi historis */}
      <span className="mt-3 inline-block rounded-full bg-accent-soft px-3 py-1 text-xs text-accent">
        {historical}
      </span>

      <RateLineChart data={data} className="mt-4" />

      <div className="mt-1 flex gap-4 font-mono text-[10px] text-muted">
        {legend.map((item) => (
          <span key={item.label} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
