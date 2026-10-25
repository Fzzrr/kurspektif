import RateLineChart, { PLAIN_RATE_SERIES, type ChartPoint } from "./RateLineChart";
import CountUp from "../motion/CountUp";

// Kartu "signature" — elemen visual khas Kurspektif.
// Menampilkan kurs, perubahan, badge posisi historis, dan grafik.
// Semua prop punya default (USD → IDR) agar pemakaian hero tetap <RateCard />.

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
  pair = "USD/IDR",
  rate = "16.234",
  changePercent = "0,8%",
  changeDir = "up",
  historical = "Lebih tinggi dari 82% hari (90 hari terakhir)",
  data = PLAIN_RATE_SERIES,
  className = "",
}: RateCardProps) {
  const isUp = changeDir === "up";

  return (
    <div
      className={`rounded-2xl p-5 text-ink ${className}`}
    >
      {/* Header: pasangan kurs + sumber data. Bukan "Live" — kursnya harian. */}
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-muted">{pair}</p>
        <span className="rounded-full bg-accent-soft px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-muted">
          Kurs harian
        </span>
      </div>

      {/* Angka utama + perubahan */}
      <p className="mt-3 font-mono text-3xl font-medium tracking-tight">
        <CountUp value={rate} />
      </p>
      <p className={`font-mono text-sm ${isUp ? "text-up" : "text-down"}`}>
        {isUp ? "+" : "−"}
        {changePercent} hari ini
      </p>

      {/* Posisi historis */}
      <span className="mt-3 inline-block rounded-full bg-accent-soft px-3 py-1 text-xs text-accent">
        {historical}
      </span>

      <RateLineChart data={data} className="mt-4" />
    </div>
  );
}
