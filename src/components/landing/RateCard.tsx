import RateLineChart from "./RateLineChart";

// Kartu "signature" — elemen visual khas Kurspektif.
// Menampilkan kurs, perubahan, badge posisi historis, grafik, dan legenda.

const legend = [
  { label: "positif", color: "var(--color-up)" },
  { label: "netral", color: "#888780" },
  { label: "negatif", color: "var(--color-down)" },
];

export default function RateCard() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-[0_18px_40px_-28px_rgba(14,31,26,0.5)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-xs text-muted">USD → IDR</p>
          <p className="font-mono text-3xl font-medium tracking-tight">16.234</p>
          <p className="font-mono text-sm text-down">▾ 0,8% hari ini</p>
        </div>
        <span className="max-w-[160px] rounded-lg bg-accent-soft px-3 py-2 text-right text-xs leading-snug text-accent">
          Lebih tinggi dari 82% hari (90 hari terakhir)
        </span>
      </div>

      <RateLineChart className="mt-4 w-full" />

      <div className="mt-1 flex gap-4 font-mono text-[11px] text-muted">
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
