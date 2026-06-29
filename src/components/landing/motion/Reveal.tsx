"use client";

// Reveal: memunculkan anak elemen dengan fade-up saat masuk viewport.
// Dipakai untuk menghidupkan section landing page. Aman terhadap
// prefers-reduced-motion (langsung tampil tanpa animasi) dan no-JS
// (lihat <noscript> di layout.tsx yang memaksa .reveal terlihat).

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Jeda animasi dalam milidetik — berguna untuk efek bertahap (stagger). */
  delay?: number;
  className?: string;
};

export default function Reveal({ children, delay = 0, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Preferensi reduce motion ditangani penuh oleh CSS (globals.css):
    // .reveal dipaksa terlihat tanpa transisi, jadi tak perlu cek di JS sini.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
