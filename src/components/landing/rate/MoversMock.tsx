// Cuplikan statis kartu "Yang menggerakkan … minggu ini" di dashboard, dipakai
// di slide fitur & pratinjau dashboard. Angkanya contoh dari satu minggu nyata
// (USD/IDR), bukan data live.
const RANKING = [
  { code: "AUD", pct: 0.77 },
  { code: "GBP", pct: 0.5 },
  { code: "JPY", pct: 0.33 },
  { code: "USD", pct: -0.34 },
  { code: "EUR", pct: -0.42 },
  { code: "IDR", pct: -0.72 },
];
const PAIR = ["USD", "IDR"];
const MAX_ABS = Math.max(...RANKING.map((row) => Math.abs(row.pct)));

const pctFormatter = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2, signDisplay: "exceptZero" });

export default function MoversMock() {
  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium">Yang menggerakkan USD/IDR minggu ini</p>
        <span className="font-mono text-sm font-medium text-up">+0,44%</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-ink">Pergerakan minggu ini terutama datang dari sisi IDR.</p>

      <p className="mt-4 font-mono text-xs text-muted">Kekuatan terhadap mata uang utama, 7 hari terakhir</p>
      <ul className="mt-3 space-y-2">
        {RANKING.map(({ code, pct }) => {
          const inPair = PAIR.includes(code);
          const width = `${(Math.abs(pct) / MAX_ABS) * 50}%`;
          return (
            <li key={code} className="flex items-center gap-3">
              <span className={`w-10 shrink-0 font-mono text-xs ${inPair ? "font-medium text-ink" : "text-muted"}`}>
                {code}
              </span>
              <div aria-hidden className="relative h-1.5 flex-1">
                <span className="absolute inset-y-[-3px] left-1/2 w-px bg-line" />
                <span
                  className={`absolute inset-y-0 rounded-full ${pct > 0 ? "bg-up" : "bg-down"} ${inPair ? "" : "opacity-35"}`}
                  style={pct > 0 ? { left: "50%", width } : { right: "50%", width }}
                />
              </div>
              <span
                className={`w-14 shrink-0 text-right font-mono text-xs ${
                  inPair ? (pct > 0 ? "text-up" : "text-down") : "text-muted"
                }`}
              >
                {pctFormatter.format(pct)}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
