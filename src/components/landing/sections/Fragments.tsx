import type { WeeklyMovers } from "@/lib/movers";
import type { NewsItem } from "@/lib/marketaux";
import { fmtPct, isMoving } from "@/lib/moversText";
import { SENTIMENT } from "@/lib/sentiment";
import { dayKey, dayLabel } from "@/lib/timeAgo";

// Potongan antarmuka asli untuk /metodologi: peringkat kekuatan dan berita.
// Semua angkanya data minggu ini.
const panel = "rounded-2xl bg-surface p-5 sm:p-6";

export function Ranking({ movers }: { movers: WeeklyMovers }) {
  const highlighted = movers.sides.map((side) => side.code);
  const max = Math.max(...movers.ranking.map((s) => Math.abs(s.strengthPct)), 0.01);
  return (
    <div data-ui className={panel}>
      <p className="text-[14px] font-medium">Kekuatan terhadap mata uang utama, 7 hari</p>
      <ul className="mt-4 space-y-2.5">
        {movers.ranking.map(({ code, strengthPct }) => {
          const inPair = highlighted.includes(code);
          const tone = !isMoving(strengthPct) ? "bg-neutral" : strengthPct > 0 ? "bg-up" : "bg-down";
          const width = `${(Math.abs(strengthPct) / max) * 50}%`;
          return (
            <li key={code} className="group flex items-center gap-3 text-[14px] tabular-nums">
              <span className={`w-10 transition-colors group-hover:text-ink ${inPair ? "font-semibold text-ink" : "text-muted"}`}>{code}</span>
              <span aria-hidden className="relative h-2 flex-1">
                <span
                  className={`absolute inset-y-0 rounded-full transition-opacity ${tone} ${inPair ? "" : "opacity-40 group-hover:opacity-100"}`}
                  style={strengthPct >= 0 ? { left: "50%", width } : { right: "50%", width }}
                />
              </span>
              <span className={`w-16 text-right transition-colors group-hover:text-ink ${inPair ? "text-ink" : "text-muted"}`}>{fmtPct(strengthPct)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Headlines({ news }: { news: NewsItem[] }) {
  return (
    <div data-ui className={panel}>
      <p className="text-[14px] font-medium">Berita kurs terbaru</p>
      <ul className="mt-4 space-y-4">
        {news.map((item) => (
          <li key={item.id}>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-[14px] leading-snug hover:underline">
              {item.headline}
            </a>
            <p className="mt-1 flex items-center gap-1.5 text-[13px] text-muted">
              <span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: SENTIMENT[item.sentiment].color }} />
              {SENTIMENT[item.sentiment].label} · {item.source} · {dayLabel(dayKey(item.publishedAt))}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
