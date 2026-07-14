"use client";

// CurrencyField: latar belakang interaktif untuk landing page Kurspektif.
// Simbol mata uang melayang pelan di seluruh halaman, condong (parallax) dan
// terdorong lembut menjauh saat kursor mendekat. Digambar di satu <canvas>
// agar ringan. Aman terhadap prefers-reduced-motion (frame statis tanpa gerak
// & tanpa reaksi kursor) dan berhenti saat tab tersembunyi.
//
// Warna mengikuti design system (lihat globals.css):
//   accent #b8902a (emas), ink #0e1f1a (hijau tua). Alpha sengaja rendah
//   agar teks di atasnya tetap terbaca.

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

const GLYPHS = ["$", "€", "£", "¥", "₹", "₽", "¢", "₩"] as const;

// Warna dari token globals.css.
const ACCENT = { r: 184, g: 144, b: 42 }; // #b8902a
const INK = { r: 14, g: 31, b: 26 }; // #0e1f1a

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  glyph: string;
  depth: number; // 0..1 — makin besar makin "dekat" (parallax lebih kuat)
  alpha: number;
  color: typeof ACCENT;
};

export default function CurrencyField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = prefersReducedMotion();

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];

    // Posisi kursor (target) + nilai yang dihaluskan untuk parallax.
    const pointer = { x: -9999, y: -9999, active: false };
    let parallaxX = 0;
    let parallaxY = 0;

    const rand = (min: number, max: number) => min + Math.random() * (max - min);

    const makeParticle = (): Particle => {
      const depth = rand(0.3, 1);
      return {
        x: rand(0, width),
        y: rand(0, height),
        vx: rand(-0.12, 0.12),
        vy: rand(-0.18, -0.04), // sedikit melayang ke atas
        size: 14 + depth * 22,
        glyph: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        depth,
        alpha: rand(0.06, 0.16) * depth,
        color: Math.random() < 0.7 ? ACCENT : INK,
      };
    };

    const build = () => {
      // Kepadatan mengikuti luas viewport, dibatasi agar mobile tetap ringan.
      const target = Math.min(28, Math.round((width * height) / 45000));
      particles = Array.from({ length: target }, () => makeParticle());
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Haluskan offset parallax menuju posisi kursor relatif ke tengah layar.
      const targetPX = pointer.active ? (pointer.x - width / 2) / width : 0;
      const targetPY = pointer.active ? (pointer.y - height / 2) / height : 0;
      parallaxX += (targetPX - parallaxX) * 0.06;
      parallaxY += (targetPY - parallaxY) * 0.06;

      for (const p of particles) {
        // Drift dasar.
        p.x += p.vx;
        p.y += p.vy;

        // Dorongan lembut menjauh dari kursor.
        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dist2 = dx * dx + dy * dy;
          const radius = 140;
          if (dist2 < radius * radius && dist2 > 0.01) {
            const dist = Math.sqrt(dist2);
            const force = (1 - dist / radius) * 1.6;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
          }
        }

        // Bungkus di tepi layar agar medan terasa tak berujung.
        const margin = p.size;
        if (p.x < -margin) p.x = width + margin;
        if (p.x > width + margin) p.x = -margin;
        if (p.y < -margin) p.y = height + margin;
        if (p.y > height + margin) p.y = -margin;

        // Parallax: partikel "dekat" bergeser lebih jauh.
        const ox = parallaxX * p.depth * 60;
        const oy = parallaxY * p.depth * 60;

        ctx.font = `${p.size}px var(--font-jetbrains), monospace`;
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha})`;
        ctx.fillText(p.glyph, p.x + ox, p.y + oy);
      }
    };

    let raf = 0;
    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };

    const onPointerMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };
    const onPointerLeave = () => {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    };
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!reduceMotion && raf === 0) {
        raf = requestAnimationFrame(loop);
      }
    };

    resize();

    if (reduceMotion) {
      // Tanpa gerak: gambar satu frame statis & jangan pasang interaksi.
      draw();
    } else {
      window.addEventListener("resize", resize);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerleave", onPointerLeave);
      document.addEventListener("visibilitychange", onVisibility);
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
    />
  );
}
