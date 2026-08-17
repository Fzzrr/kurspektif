"use client";

// Swiper "cuplikan fitur": tiap slide adalah mockup visual sebuah fitur
// (bukan sekadar kartu teks), supaya pengunjung bisa melihat wujud fitur.
// Dibangun dengan Embla — geser manual/drag + tombol prev/next + dots.
// Tanpa autoplay agar ramah prefers-reduced-motion & konsisten dgn proyek.

import { useEffect, useState, type ReactNode } from "react";
import useEmblaCarousel from "embla-carousel-react";
import RateLineChart from "./RateLineChart";
import { ArrowRight, BellIcon } from "@/components/ui/icons";

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
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_24px_60px_-36px_rgba(14,31,26,0.55)]">
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

// 1. Sentimen menempel di grafik → reuse RateLineChart (titik sentimen bawaan).
function ChartMock() {
  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-xs text-muted">USD → IDR</p>
        <p className="font-mono text-2xl font-medium">16.234</p>
      </div>
      <RateLineChart className="mt-2 w-full" />
    </div>
  );
}

// 2. Rangkuman mingguan → panel teks bergaya "Yang menggerakkan minggu ini".
function SummaryMock() {
  return (
    <div className="w-full rounded-xl border border-line bg-surface p-5">
      <p className="text-sm font-medium">
        <span className="text-accent">✦</span> Yang menggerakkan minggu ini
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Rupiah cenderung melemah seiring ekspektasi The Fed menunda pemangkasan
        suku bunga, sementara data domestik relatif netral. Tekanan utama datang
        dari penguatan dolar global, bukan dari faktor lokal.
      </p>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-wide text-neutral">
        Rangkuman · Pekan ini
      </p>
    </div>
  );
}

// 3. Konteks mahal/murah → indikator persentil 90 hari.
function PercentileMock() {
  const position = 72; // posisi kurs hari ini relatif rentang 90 hari (%).
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-wide text-muted">
          Persentil 90 hari
        </span>
        <span className="rounded-full bg-accent-soft px-2.5 py-0.5 font-mono text-xs text-accent">
          P{position}
        </span>
      </div>

      <div className="relative mt-4 h-2 rounded-full bg-line">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-accent/40"
          style={{ width: `${position}%` }}
        />
        <span
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-accent shadow"
          style={{ left: `${position}%` }}
        />
      </div>

      <div className="mt-2 flex justify-between font-mono text-[10px] text-muted">
        <span>Murah</span>
        <span>Mahal</span>
      </div>

      <p className="mt-4 text-sm text-muted">
        Kurs hari ini berada di sisi mahal rentang 90 harinya — konteks yang
        membantumu menahan diri atau bertindak.
      </p>
    </div>
  );
}

// 4. Alert yang membawa alasan → mockup notifikasi.
function AlertMock() {
  return (
    <div className="w-full rounded-xl border border-line bg-surface p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <BellIcon className="size-[18px]" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium">
            USD/IDR menembus 16.250{" "}
            <span className="font-mono text-down">▲ 0,8%</span>
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Kemungkinan dipicu: <span className="text-ink">“The Fed sinyalkan
            suku bunga tinggi lebih lama”</span>
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-neutral">
            Alert · 2 menit lalu
          </p>
        </div>
      </div>
    </div>
  );
}

// Data slide — judul/eyebrow diturunkan dari fitur yang sebelumnya berupa kartu teks.
const slides: { eyebrow: string; title: string; desc: string; visual: ReactNode }[] = [
  {
    eyebrow: "Grafik + Sentimen",
    title: "Sentimen menempel di grafik",
    desc: "Titik warna menandai hari saat berita penting terbit — gerakan kurs langsung terkait peristiwa.",
    visual: <ChartMock />,
  },
  {
    eyebrow: "Rangkuman",
    title: "Rangkuman mingguan",
    desc: "Satu paragraf bahasa manusia tentang kenapa rupiah bergerak ke arah tertentu pekan ini.",
    visual: <SummaryMock />,
  },
  {
    eyebrow: "Konteks Harga",
    title: "Mahal atau murah",
    desc: "Indikator persentil 90 hari menempatkan kurs hari ini relatif terhadap rentang historisnya.",
    visual: <PercentileMock />,
  },
  {
    eyebrow: "Alert",
    title: "Alert yang membawa alasan",
    desc: "Saat kurs menembus ambang, notifikasi turut menyertakan berita yang kemungkinan jadi pemicunya.",
    visual: <AlertMock />,
  },
];

const navButtonClass =
  "flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors duration-200 hover:border-accent hover:text-accent";

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
