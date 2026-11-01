"use client";

// Fitur sebagai deretan tab di navbar (layar lebar). Di landing, tab bab yang
// sedang dibaca menyala, dan penandanya meluncur dari tab ke tab mengikuti
// gulir. Di halaman lain tidak ada bab, jadi tidak ada yang menyala; tautannya
// (/#…) tetap membawa ke babnya.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FEATURES } from "./FeatureMenu";

export default function FeatureTabs() {
  const [active, setActive] = useState<number | null>(null);
  const [mark, setMark] = useState<{ left: number; width: number } | null>(null);
  const links = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const sections = FEATURES.map((f) => document.getElementById(f.href.slice(2)));
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      const index = sections.findIndex((el) => {
        const box = el?.getBoundingClientRect();
        return box !== undefined && box.top <= line && box.bottom > line;
      });
      setActive(index === -1 ? null : index);
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

  // Posisi penanda diambil dari tab aktif (ukuran tab bergantung pada teksnya).
  useEffect(() => {
    const el = active === null ? null : links.current[active];
    setMark(el ? { left: el.offsetLeft, width: el.offsetWidth } : null);
  }, [active]);

  return (
    <div className="relative hidden items-center rounded-full bg-[color-mix(in_srgb,var(--nav-ink)_8%,transparent)] p-1 text-[14px] lg:flex">
      <span
        aria-hidden
        className="absolute inset-y-1 left-0 rounded-full bg-(--nav-ink) transition-[translate,width,opacity] duration-300 ease-snap"
        style={{ translate: `${mark?.left ?? 0}px 0`, width: mark?.width ?? 0, opacity: mark ? 1 : 0 }}
      />
      {FEATURES.map((feature, i) => (
        <Link
          key={feature.href}
          ref={(el) => {
            links.current[i] = el;
          }}
          href={feature.href}
          aria-current={active === i ? "location" : undefined}
          className={`relative rounded-full px-3.5 py-1.5 transition-colors duration-300 ${
            active === i ? "text-(--nav-bg)" : "opacity-80 hover:opacity-100"
          }`}
        >
          {feature.label}
        </Link>
      ))}
    </div>
  );
}
