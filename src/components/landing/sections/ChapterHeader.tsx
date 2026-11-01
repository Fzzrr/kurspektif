"use client";

// Header yang menempel di atas dan mengambil warna bab di bawahnya: tiap
// section landing bertanda `data-field` adalah bidang warna penuh, jadi saat
// tepi bidang lewat di bawah header, latar & tintanya ikut berganti (300ms,
// lihat .chapter-nav). Halaman tanpa `data-field` tetap memakai warna paper.
import { useEffect, useRef, type ReactNode } from "react";

export default function ChapterHeader({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = ref.current;
    const fields = [...document.querySelectorAll<HTMLElement>("[data-field]")];
    if (!header || fields.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const line = header.offsetHeight / 2;
      const field = fields.find((el) => {
        const box = el.getBoundingClientRect();
        return box.top <= line && box.bottom > line;
      });
      if (!field) return;
      const style = getComputedStyle(field);
      header.style.setProperty("--nav-bg", style.backgroundColor);
      header.style.setProperty("--nav-ink", style.color);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <header ref={ref} className="chapter-nav sticky top-0 z-40">
      {children}
    </header>
  );
}
