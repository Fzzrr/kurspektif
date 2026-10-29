'use client';

import { useState, type KeyboardEvent, type PointerEvent } from 'react';
import { formatRate } from '@/lib/rateStats';
import type { RatePoint } from '@/lib/frankfurter';

const dateFormatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

// Garis kurs tanpa sumbu — skalanya dibaca dari label terendah/tertinggi di
// bawahnya. Geser kursor atau jari di atasnya (atau panah kiri/kanan) untuk
// membaca kurs hari mana pun; tanpa itu, titiknya ada di kurs terakhir.
export default function Sparkline({ points, quote }: { points: RatePoint[]; quote: string }) {
  const [index, setIndex] = useState<number | null>(null);
  const values = points.map((p) => p.rate);
  const min = Math.min(...values);
  const span = Math.max(...values) - min || 1;
  const last = values.length - 1;
  const x = (i: number) => (i / last) * 100;
  const y = (v: number) => 100 - ((v - min) / span) * 100;
  const shown = index ?? last;
  const point = points[shown];

  function pick(event: PointerEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    setIndex(Math.round(Math.min(1, Math.max(0, (event.clientX - box.left) / box.width)) * last));
  }

  function step(event: KeyboardEvent<HTMLDivElement>) {
    const next = { ArrowLeft: shown - 1, ArrowRight: shown + 1, Home: 0, End: last }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setIndex(Math.min(last, Math.max(0, next)));
  }

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label="Kurs per hari"
      aria-valuemin={0}
      aria-valuemax={last}
      aria-valuenow={shown}
      aria-valuetext={`${formatRate(point.rate)} ${quote}, ${dateFormatter.format(new Date(point.date))}`}
      onPointerDown={pick}
      onPointerMove={pick}
      onPointerLeave={() => setIndex(null)}
      onKeyDown={step}
      onBlur={() => setIndex(null)}
      className="relative my-3 h-20 cursor-crosshair touch-pan-y rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="size-full overflow-visible" aria-hidden>
        <polyline
          points={values.map((v, i) => `${x(i)},${y(v)}`).join(' ')}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          className="text-ink/70"
        />
      </svg>
      {index !== null && (
        <>
          <span className="pointer-events-none absolute inset-y-0 w-px bg-ink/25" style={{ left: `${x(index)}%` }} />
          <span
            className="pointer-events-none absolute -top-1 -translate-y-full whitespace-nowrap rounded-md bg-accent-soft px-2 py-1 font-mono text-xs text-ink"
            style={x(index) < 50 ? { left: `${x(index)}%` } : { right: `${100 - x(index)}%` }}
          >
            {formatRate(point.rate)} <span className="text-muted">· {dateFormatter.format(new Date(point.date))}</span>
          </span>
        </>
      )}
      <span
        className="pointer-events-none absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink"
        style={{ left: `${x(shown)}%`, top: `${y(values[shown])}%` }}
      />
    </div>
  );
}
