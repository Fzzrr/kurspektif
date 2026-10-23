"use client";

// Swiper "cuplikan fitur": tiap slide adalah mockup visual sebuah fitur
// (bukan sekadar kartu teks), supaya pengunjung bisa melihat wujud fitur.
// Dibangun dengan Embla — geser manual/drag + tombol prev/next + dots.
// Tanpa autoplay agar ramah prefers-reduced-motion & konsisten dgn proyek.

import { useEffect, useState, type ReactNode } from "react";
import useEmblaCarousel from "embla-carousel-react";
import RateLineChart, { PLAIN_RATE_SERIES, formatRate } from "./RateLineChart";
import MoversMock from "./MoversMock";
import { ArrowRight } from "@/components/ui/icons";
import { SENTIMENT, type Sentiment } from "@/lib/sentiment";

// Frame "kartu cuplikan" bergaya DashboardPreview: eyebrow + judul + visual.
function SlideCard({
  eyebrow,
  title,
  desc,
  children,
}: {
  eyebrow: string;
  title: string;
  desc: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl">
      <div className="border-b border-line px-6 pt-6">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
          {eyebrow}
        </p>
        <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">
          {title}
        </h3>
        <p className="mb-5 mt-2 text-sm text-muted">{desc}</p>
      </div>
      <div className="flex flex-1 items-center bg-paper p-6">{children}</div>
    </div>
  );
}

// --- Mockup visual per fitur -------------------------------------------------

// Setiap mockup meniru kartu yang benar-benar ada di dashboard — landing tidak
// boleh menjanjikan fitur yang belum dibangun.

// 1. Berita bertanda sentimen → baris berita seperti halaman Berita.
const SAMPLE_NEWS: { headline: string; source: string; time: string; sentiment: Sentiment }[] = [
  { headline: "Dollar girded by bets on a US hiking cycle", source: "economictimes.indiatimes.com", time: "2 jam lalu", sentiment: "positif" },
  { headline: "Gold has delivered 23% returns since 2019", source: "livemint.com", time: "5 jam lalu", sentiment: "netral" },
  { headline: "Peso at new record low; stocks fall", source: "manilatimes.net", time: "Kemarin", sentiment: "negatif" },
];

function NewsMock() {
  return (
    <ul className="w-full divide-y divide-line">
      {SAMPLE_NEWS.map((item) => {
        const { color, label } = SENTIMENT[item.sentiment];
        return (
          <li key={item.headline} className="py-3 first:pt-0 last:pb-0">
            <p className="text-sm text-ink">{item.headline}</p>
            <p className="mt-1 flex items-center gap-1.5 font-mono text-[10px] text-muted">
              <span className="inline-block size-1.5 rounded-full" style={{ backgroundColor: color }} />
              {label} · {item.source} · {item.time}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

// 2. Konteks mahal/murah → sama dengan kartu "Posisi historis".
function PercentileMock() {
  const position = 72; // posisi kurs hari ini relatif rentang 90 hari (%).
  return (
    <div className="w-full">
      <span className="inline-block rounded-full bg-accent-soft px-3 py-1 font-mono text-xs text-accent">
        Lebih tinggi dari {position}% hari (90 hari terakhir)
      </span>

      <div className="relative mt-6 h-1.5 rounded-full bg-line">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-down opacity-60"
          style={{ width: `${position}%` }}
        />
        <span
          className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-down"
          style={{ left: `${position}%` }}
        />
      </div>

      <div className="mt-2 flex justify-between font-mono text-[10px] text-muted">
        <span>Terendah 90 hari</span>
        <span>Tertinggi 90 hari</span>
      </div>

      <p className="mt-4 text-sm text-muted">
        Kurs hari ini berada di sisi mahal rentang 90 harinya — konteks yang
        membantumu menahan diri atau bertindak.
      </p>
    </div>
  );
}

// 3. Grafik kurs → rentang waktu + ringkasan periode, seperti kartu Grafik Kurs.
function ChartMock() {
  const rates = PLAIN_RATE_SERIES.map((point) => point.rate);
  const stats = [
    { label: "Tertinggi", value: Math.max(...rates) },
    { label: "Terendah", value: Math.min(...rates) },
    { label: "Rerata", value: rates.reduce((sum, rate) => sum + rate, 0) / rates.length },
  ];
  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-xs text-muted">USD/IDR · 30 hari terakhir</p>
        <div className="flex gap-1 rounded-full bg-accent-soft p-1 font-mono text-[11px]">
          {["7H", "30H", "90H", "1T"].map((range) => (
            <span
              key={range}
              className={`rounded-full px-2.5 py-1 ${range === "30H" ? "bg-ink text-paper" : "text-muted"}`}
            >
              {range}
            </span>
          ))}
        </div>
      </div>
      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[11px]">
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt className="text-muted">{stat.label}</dt>
            <dd className="mt-0.5 text-ink">{formatRate(stat.value)}</dd>
          </div>
        ))}
      </dl>
      <RateLineChart data={PLAIN_RATE_SERIES} className="mt-2 w-full" showAverage />
    </div>
  );
}

const slides: { eyebrow: string; title: string; desc: string; visual: ReactNode }[] = [
  {
    eyebrow: "Penggerak mingguan",
    title: "Sisi mana yang sebenarnya bergerak",
    desc: "Tiap mata uang di pasanganmu dibandingkan dengan mata uang utama — jadi kelihatan apakah dolar yang menguat atau rupiah yang melemah.",
    visual: <MoversMock />,
  },
  {
    eyebrow: "Berita",
    title: "Berita yang sudah ditandai sentimen",
    desc: "Berita finansial dikelompokkan per hari, ditandai positif, netral, atau negatif, dan bisa disaring per mata uang.",
    visual: <NewsMock />,
  },
  {
    eyebrow: "Konteks harga",
    title: "Mahal atau murah",
    desc: "Posisi kurs hari ini dibanding rentang 90 hari terakhirnya.",
    visual: <PercentileMock />,
  },
  {
    eyebrow: "Grafik",
    title: "Dari 7 hari sampai 1 tahun",
    desc: "Pilih rentang waktunya — tertinggi, terendah, dan rerata periode langsung terlihat.",
    visual: <ChartMock />,
  },
];

const navButtonClass =
  "flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-ink transition-colors duration-200 hover:border-accent hover:text-accent";

export default function FeatureSwiper() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    // Selaraskan dot aktif dengan slide yang sedang tampil. Index awal 0 sudah
    // benar, jadi cukup subscribe event (hindari setState sinkron di effect).
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect).on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect).off("reInit", onSelect);
    };
  }, [emblaApi]);

  return (
    <div>
      <div
        className="overflow-hidden"
        ref={emblaRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Cuplikan fitur"
      >
        <div className="flex">
          {slides.map((slide) => (
            <div
              key={slide.title}
              className="min-w-0 flex-[0_0_100%] pr-4 last:pr-0 md:flex-[0_0_85%]"
            >
              <SlideCard
                eyebrow={slide.eyebrow}
                title={slide.title}
                desc={slide.desc}
              >
                {slide.visual}
              </SlideCard>
            </div>
          ))}
        </div>
      </div>

      {/* Kontrol */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.title}
              type="button"
              onClick={() => emblaApi?.scrollTo(i)}
              aria-label={`Ke slide ${i + 1}: ${slide.title}`}
              aria-current={i === selectedIndex}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === selectedIndex ? "w-6 bg-accent" : "w-2 bg-line hover:bg-neutral"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Slide sebelumnya"
            className={navButtonClass}
          >
            <ArrowRight className="size-[18px] rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Slide berikutnya"
            className={navButtonClass}
          >
            <ArrowRight className="size-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
