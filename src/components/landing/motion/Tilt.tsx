"use client";

// Tilt: membungkus anak elemen agar miring mengikuti kursor dalam perspektif
// 3D, dengan kilau (glare) yang ikut bergeser. Dipakai pada kartu signature
// hero untuk kesan "hidup & berani". Mati total saat prefers-reduced-motion
// atau pada perangkat sentuh (tanpa hover) agar tidak mengganggu.

import {
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import { prefersReducedMotion } from "@/lib/motion";

type Props = {
  children: ReactNode;
  /** Sudut maksimum kemiringan (derajat). */
  max?: number;
  className?: string;
};

export default function Tilt({ children, max = 9, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({});
  const [glare, setGlare] = useState<CSSProperties>({ opacity: 0 });

  // Hanya aktif di perangkat berkursor & saat pengguna tidak menolak gerak.
  const enabled = () =>
    window.matchMedia("(hover: hover)").matches && !prefersReducedMotion();

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || !enabled()) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width; // 0..1
    const py = (e.clientY - r.top) / r.height; // 0..1
    const rotateY = (px - 0.5) * 2 * max;
    const rotateX = -(py - 0.5) * 2 * max;
    setStyle({
      transform: `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`,
      transition: "transform 80ms ease-out",
    });
    setGlare({
      opacity: 1,
      background: `radial-gradient(420px circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.28), transparent 45%)`,
    });
  };

  const onLeave = () => {
    setStyle({
      transform: "perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)",
      transition: "transform 500ms cubic-bezier(.22,1,.36,1)",
    });
    setGlare({ opacity: 0 });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={style}
      className={`relative will-change-transform ${className}`}
    >
      {children}
      {/* Kilau yang mengikuti kursor — di atas konten, tak menangkap pointer. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 rounded-2xl transition-opacity duration-300"
        style={glare}
      />
    </div>
  );
}
