// Helper gerak yang dipakai bersama komponen animasi landing page.

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const REDUCE_MOTION = "(prefers-reduced-motion: reduce)";

/** True bila pengguna meminta gerak seminimal mungkin. Panggil di dalam
 *  effect/handler — bukan saat render — karena membaca `window`. */
export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia(REDUCE_MOTION).matches;

/** Versi reaktif dari `prefersReducedMotion` untuk dipakai saat render:
 *  ikut berubah bila pengguna mengganti preferensinya tanpa memuat ulang. */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(REDUCE_MOTION);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCE_MOTION).matches,
    () => false, // Di server preferensi tak diketahui; CSS yang menahan animasi.
  );
}

/** Menandai elemen begitu pertama kali masuk viewport, lalu berhenti mengamati.
 *  Dasar dari Reveal (fade-up) & CountUp (angka berhitung). Opsinya primitif
 *  agar identitasnya stabil antar-render dan observer tidak dipasang ulang. */
export function useInViewOnce<T extends HTMLElement>({
  threshold = 0,
  rootMargin = "0px",
}: { threshold?: number; rootMargin?: string } = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setInView(true);
        io.disconnect();
      },
      { threshold, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin]);

  return [ref, inView] as const;
}
