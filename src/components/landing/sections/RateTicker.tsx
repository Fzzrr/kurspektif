// Ticker kurs berjalan — aksen "hidup" bergaya terminal finansial.
// Marquee murni CSS (Server Component): daftar digandakan agar loop mulus,
// animasi berhenti saat hover (lihat .ticker / .ticker-track di globals.css).

const rates = [
  { pair: "USD/IDR", value: "16.234", delta: "0,8%", dir: "up" },
  { pair: "EUR/IDR", value: "17.965", delta: "1,2%", dir: "up" },
  { pair: "JPY/IDR", value: "104,2", delta: "0,3%", dir: "down" },
  { pair: "SGD/IDR", value: "12.080", delta: "0,2%", dir: "up" },
  { pair: "GBP/IDR", value: "20.640", delta: "0,5%", dir: "down" },
  { pair: "AUD/IDR", value: "10.720", delta: "0,4%", dir: "up" },
  { pair: "CNY/IDR", value: "2.245", delta: "0,1%", dir: "up" },
  { pair: "MYR/IDR", value: "3.510", delta: "0,2%", dir: "down" },
] as const;

export default function RateTicker() {
  // Gandakan daftar agar transform -50% terlihat menyambung tanpa putus.
  const row = [...rates, ...rates];

  return (
    <div className="ticker group relative overflow-hidden border-y border-white/10 bg-ink py-3 text-paper">
      {/* Gradien tepi agar item masuk/keluar terasa halus */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16"
        style={{ background: "linear-gradient(to right, var(--color-ink), transparent)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16"
        style={{ background: "linear-gradient(to left, var(--color-ink), transparent)" }}
      />

      <div className="ticker-track flex w-max items-center will-change-transform">
        {row.map((rate, i) => {
          const up = rate.dir === "up";
          return (
            <span
              key={`${rate.pair}-${i}`}
              className="flex items-center gap-2 pr-8 font-mono text-sm"
            >
              <span className="text-paper/70">{rate.pair}</span>
              <span className="text-paper">{rate.value}</span>
              <span className={up ? "text-up" : "text-down"}>
                {up ? "▲" : "▼"} {rate.delta}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
