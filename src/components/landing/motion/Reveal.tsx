"use client";

// Reveal: memunculkan anak elemen dengan fade-up saat masuk viewport.
// Dipakai untuk menghidupkan section landing page. Aman terhadap
// prefers-reduced-motion (CSS memaksa .reveal langsung terlihat tanpa
// transisi) dan no-JS (lihat <noscript> di layout.tsx).

import type { ReactNode } from "react";
import { useInViewOnce } from "@/lib/motion";

type Props = {
  children: ReactNode;
  /** Jeda animasi dalam milidetik — berguna untuk efek bertahap (stagger). */
  delay?: number;
  className?: string;
};

export default function Reveal({ children, delay = 0, className = "" }: Props) {
  const [ref, visible] = useInViewOnce<HTMLDivElement>({
    threshold: 0.15,
    rootMargin: "0px 0px -10% 0px",
  });

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
