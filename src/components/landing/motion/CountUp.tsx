"use client";

// CountUp: angka yang "berhitung naik" menuju nilai akhir saat masuk viewport.
// Memberi kesan data hidup pada angka kurs & statistik. Aman terhadap
// prefers-reduced-motion (langsung tampil nilai akhir, tanpa animasi).
//
// Format mengikuti lokal id-ID (pemisah ribuan "."). `value` menerima string
// hasil format (mis. "16.234" atau "104,2") agar pemakaian tetap deklaratif;
// jumlah desimal disimpulkan dari koma pada string.

import { useEffect, useRef, useState } from "react";

type Props = {
  /** Nilai akhir dalam format id-ID, mis. "16.234" atau "104,2". */
  value: string;
  /** Durasi animasi (ms). */
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
};

// "16.234" -> 16234 ; "104,2" -> 104.2
function parseId(str: string) {
  const cleaned = str.replace(/\./g, "").replace(",", ".");
  return Number.parseFloat(cleaned) || 0;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export default function CountUp({
  value,
  duration = 1300,
  className,
  prefix = "",
  suffix = "",
}: Props) {
  const target = parseId(value);
  const decimals = value.includes(",") ? value.split(",")[1].length : 0;
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDisplay(value);
      return;
    }

    const fmt = new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    let raf = 0;
    let started = false;

    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        const current = target * easeOutCubic(t);
        setDisplay(fmt.format(current));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          started = true;
          run();
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
    // value menentukan target & format; perubahan value memulai ulang.
  }, [value, target, decimals, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
