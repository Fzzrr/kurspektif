import Image from "next/image";
import type { WeeklyMovers } from "@/lib/movers";
import type { EconomicEvent } from "@/lib/calendar";
import type { NewsItem } from "@/lib/marketaux";
import { fmtPct, isMoving } from "@/lib/moversText";
import { SENTIMENT } from "@/lib/sentiment";
import { dayKey, dayLabel, todayKey } from "@/lib/timeAgo";
import Reveal from "../motion/Reveal";

// Foto arsip gedung De Javasche Bank di separuh kiri (menempel saat digulir),
// tiga potongan antarmuka asli di kanan: peringkat kekuatan, agenda, berita.
// Semua angkanya data minggu ini.
const panel = "rounded-2xl bg-surface p-5 sm:p-6";

export function Ranking({ movers }: { movers: WeeklyMovers }) {
  const max = Math.max(...movers.ranking.map((s) => Math.abs(s.strengthPct)), 0.01);
  return (
    <div data-ui className={panel}>
      <p className="text-[14px] font-medium">Kekuatan terhadap mata uang utama, 7 hari</p>
      <ul className="mt-4 space-y-2.5">
        {movers.ranking.map(({ code, strengthPct }) => {
          const inPair = code === "USD" || code === "IDR";
          const tone = !isMoving(strengthPct) ? "bg-neutral" : strengthPct > 0 ? "bg-up" : "bg-down";
          const width = `${(Math.abs(strengthPct) / max) * 50}%`;
          return (
            <li key={code} className="flex items-center gap-3 text-[14px] tabular-nums">
              <span className={`w-10 ${inPair ? "font-semibold text-ink" : "text-muted"}`}>{code}</span>
              <span aria-hidden className="relative h-2 flex-1">
                <span
                  className={`absolute inset-y-0 rounded-full ${tone} ${inPair ? "" : "opacity-40"}`}
                  style={strengthPct >= 0 ? { left: "50%", width } : { right: "50%", width }}
                />
              </span>
              <span className={`w-16 text-right ${inPair ? "text-ink" : "text-muted"}`}>{fmtPct(strengthPct)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Agenda({ events }: { events: EconomicEvent[] }) {
  const today = todayKey();
  return (
    <div data-ui className={panel}>
      <p className="text-[14px] font-medium">Agenda yang bisa menggerakkan rupiah</p>
      <ul className="mt-4 space-y-3">
        {events.map((event) => (
          <li key={`${event.date}${event.title}`} className="grid grid-cols-[7.5rem_1fr] gap-3 text-[14px]">
            <span className="tabular-nums text-muted">
              {dayLabel(event.date)}
              {event.time && <span className="block">{event.time} WIB</span>}
            </span>
            <span className={event.date < today ? "text-muted" : "text-ink"}>
              {event.title}
              {event.date < today && " (sudah lewat)"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Headlines({ news }: { news: NewsItem[] }) {
  return (
    <div data-ui className={panel}>
      <p className="text-[14px] font-medium">Berita rupiah terbaru</p>
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

type Props = { movers: WeeklyMovers | null; agenda: EconomicEvent[]; news: NewsItem[] };

export default function Reasons({ movers, agenda, news }: Props) {
  return (
    <section className="grid gap-10 px-5 py-28 sm:px-10 sm:py-40 lg:grid-cols-2 lg:gap-10">
      <figure className="lg:sticky lg:top-8 lg:self-start">
        <Image
          src="/arsip/javasche-bank.jpg"
          alt="Foto arsip gedung De Javasche Bank di Batavia: bangunan bertiang dengan menara jam kecil di tengah."
          width={1920}
          height={1426}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="archive-photo h-auto w-full"
        />
        <figcaption className="mt-3 text-[14px] text-muted">
          Gedung De Javasche Bank di Batavia, bank sirkulasi yang kemudian menjadi Bank Indonesia.
        </figcaption>
      </figure>

      <div>
        <Reveal>
          <h2 className="text-[34px] font-semibold leading-tight tracking-[-0.02em]">Alasannya bisa dibaca</h2>
        </Reveal>
        <Reveal delay={80}>
          <p className="mt-4 max-w-[52ch] text-[17px] leading-relaxed">
            Kurs bergerak karena keputusan bank sentral, data ekonomi, dan kabar yang beredar. Kurspektif menaruh
            ketiganya di sebelah angkanya.
          </p>
        </Reveal>
        <div className="mt-10 space-y-4">
          {movers && (
            <Reveal delay={140}>
              <Ranking movers={movers} />
            </Reveal>
          )}
          {agenda.length > 0 && (
            <Reveal delay={200}>
              <Agenda events={agenda} />
            </Reveal>
          )}
          {news.length > 0 && (
            <Reveal delay={260}>
              <Headlines news={news} />
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
