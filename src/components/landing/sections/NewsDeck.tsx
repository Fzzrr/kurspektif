"use client";

// Berita bertanda sentimen sebagai deretan kartu. Di layar lebar isinya
// menempel di bawah header (setinggi isinya saja, jadi tidak menyisakan ruang
// kosong saat lepas): tiap langkah gulir memasukkan kartu
// berikutnya dari kanan dan melipat kartu sebelumnya jadi "punggung buku"
// 120px di kiri (klik untuk membukanya lagi). Di ponsel kartunya bertumpuk.
import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import type { NewsItem } from "@/lib/marketaux";
import { SENTIMENT } from "@/lib/sentiment";
import { dayKey, dayLabel } from "@/lib/timeAgo";
import { heading } from "../type";

const TONES = ["bg-surface", "bg-accent-soft", "bg-line"];
const SPINE = 120;
const GAP = 4;
const CARD = 620;
const HEADER = 64; // tinggi header yang menempel (h-16)
// Judul dipotong di batas kata supaya muat dua baris di kartu 620px.
const short = (text: string, max = 80) => (text.length <= max ? text : `${text.slice(0, text.lastIndexOf(" ", max))}…`);

export default function NewsDeck({ news }: { news: NewsItem[] }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = wrapper.current;
    const pinned = stage.current;
    if (!el || !pinned) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const box = el.getBoundingClientRect();
      // Jarak gulir selama isinya menempel (top = tinggi header).
      const travel = box.height - pinned.offsetHeight;
      if (travel <= 0) return;
      const progress = Math.min(1, Math.max(0, (HEADER - box.top) / travel));
      setActive(Math.min(news.length - 1, Math.floor(progress * news.length)));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
    };
  }, [news.length]);

  // Klik punggung buku: gulir halaman ke langkah kartu itu.
  function open(index: number) {
    const el = wrapper.current;
    const pinned = stage.current;
    if (!el || !pinned) return;
    const travel = el.offsetHeight - pinned.offsetHeight;
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER;
    window.scrollTo({ top: top + ((index + 0.5) / news.length) * travel, behavior: "smooth" });
  }

  return (
    <section id="berita" data-field className="scroll-mt-16 bg-paper text-ink">
      <div ref={wrapper} className="lg:h-[200svh]">
        {/* Mulai dari atas (bukan ditengahkan): bab sebelumnya berwarna sama, jadi jaraknya cukup segini. */}
        <div ref={stage} className="px-5 pb-20 pt-12 sm:px-10 sm:pb-24 sm:pt-16 lg:sticky lg:top-16">
          <h2 className={heading}>Berita, sudah ditandai</h2>
          <p className="mt-4 max-w-[52ch] text-[17px] leading-relaxed">
            Berita kurs dari media global dan Indonesia, masing-masing diberi tanda positif, netral, atau negatif untuk
            mata uang yang dibahasnya.
          </p>

          <ol data-ui className="mt-10 space-y-3 lg:relative lg:h-[300px] lg:space-y-0 lg:overflow-hidden">
            {news.map((item, i) => {
              const folded = i < active;
              const x = `${i <= active ? i * (SPINE + GAP) : active * (SPINE + GAP) + (i - active) * (CARD + GAP)}px`;
              return (
                <li
                  key={item.id}
                  data-folded={folded || undefined}
                  className={`news-card relative flex flex-col p-6 sm:p-8 lg:absolute lg:inset-y-0 lg:left-0 lg:w-[620px] ${TONES[i % TONES.length]}`}
                  style={
                    {
                      "--x": x,
                      "--clip": folded ? `inset(0 ${CARD - SPINE}px 0 0)` : "inset(0 0 0 0)",
                    } as CSSProperties
                  }
                >
                  <span aria-hidden className="news-spine absolute left-6 top-8 hidden text-[24px] font-semibold lg:block">
                    {item.headline.split(" ")[0]}
                  </span>
                  {folded && (
                    <button
                      type="button"
                      onClick={() => open(i)}
                      aria-label={`Buka berita: ${item.headline}`}
                      className="absolute inset-0 z-10 hidden lg:block"
                    />
                  )}
                  <div className="news-body flex flex-1 flex-col">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      tabIndex={folded ? -1 : undefined}
                      title={item.headline}
                      className="text-[24px] font-semibold leading-tight hover:underline sm:text-[28px]"
                    >
                      {short(item.headline)}
                    </a>
                    {item.summary && <p className="mt-3 line-clamp-2 text-[17px] leading-relaxed text-ink/80">{item.summary}</p>}
                    <p className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6 text-[16px]">
                      <span className="flex items-center gap-2">
                        <span aria-hidden className="size-2.5 rounded-full" style={{ backgroundColor: SENTIMENT[item.sentiment].color }} />
                        {SENTIMENT[item.sentiment].label} · {dayLabel(dayKey(item.publishedAt))}
                      </span>
                      <span className="text-ink/70">{item.source}</span>
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          <p className="mt-12 flex flex-wrap gap-x-6 gap-y-2 text-[17px]">
            <span>{news.length} berita terbaru dari arsip hari ini.</span>
            <Link href="/dashboard/berita" className="link-line font-medium">
              Semua berita ada di dashboard
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
