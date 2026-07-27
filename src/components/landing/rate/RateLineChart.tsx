"use client";

// Grafik garis interaktif (recharts) dengan titik sentimen berita.
// Dipakai di kartu hero. Hover menampilkan kurs per hari + label sentimen.
// Memakai pola ukur-kontainer (ResizeObserver) seperti LiveCurrencyChart,
// alih-alih ResponsiveContainer, untuk menghindari warning width/height(-1).

import { useEffect, useMemo, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import { usePrefersReducedMotion } from "@/lib/motion";
import { SENTIMENT, type Sentiment } from "@/lib/sentiment";

export type ChartPoint = {
  day: string;
  rate: number;
  sentiment?: Sentiment;
};

// Data ilustrasi default (USD → IDR) 30 hari terakhir (H-30 = terlama, H-1 = terbaru).
const DEFAULT_RATE_SERIES: ChartPoint[] = [
  { day: "H-30", rate: 16190 },
  { day: "H-29", rate: 16175 },
  { day: "H-28", rate: 16140 },
  { day: "H-27", rate: 16110 },
  { day: "H-26", rate: 16095 },
  { day: "H-25", rate: 16120 },
  { day: "H-24", rate: 16150, sentiment: "netral" },
  { day: "H-23", rate: 16185 },
  { day: "H-22", rate: 16210 },
  { day: "H-21", rate: 16205 },
  { day: "H-20", rate: 16230 },
  { day: "H-19", rate: 16260 },
  { day: "H-18", rate: 16295, sentiment: "positif" },
  { day: "H-17", rate: 16285 },
  { day: "H-16", rate: 16270 },
  { day: "H-15", rate: 16300 },
  { day: "H-14", rate: 16320 },
  { day: "H-13", rate: 16330 },
  { day: "H-12", rate: 16310 },
  { day: "H-11", rate: 16290 },
  { day: "H-10", rate: 16260 },
  { day: "H-9", rate: 16235 },
  { day: "H-8", rate: 16210 },
  { day: "H-7", rate: 16180 },
  { day: "H-6", rate: 16150, sentiment: "negatif" },
  { day: "H-5", rate: 16165 },
  { day: "H-4", rate: 16190 },
  { day: "H-3", rate: 16210 },
  { day: "H-2", rate: 16225 },
  { day: "H-1", rate: 16240 },
];

export const formatRate = (value: number) =>
  new Intl.NumberFormat("id-ID", { maximumSignificantDigits: 6 }).format(value);

function CustomTooltip({ active, payload }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as ChartPoint;
  const sentiment = point.sentiment ? SENTIMENT[point.sentiment] : null;

  return (
    <div className="rounded-lg border border-line bg-surface px-2.5 py-1.5 font-mono text-[11px] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)]">
      <p className="text-muted">{point.day}</p>
      <p className="font-medium text-ink">Rp {formatRate(point.rate)}</p>
      {sentiment && (
        <p className="mt-0.5 flex items-center gap-1" style={{ color: sentiment.color }}>
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: sentiment.color }} />
          {sentiment.label}
        </p>
      )}
    </div>
  );
}

type Props = {
  data?: ChartPoint[];
  className?: string;
};

// Durasi garis "menggambar diri". Titik sentimen muncul setelahnya.
const DRAW_MS = 1100;

export default function RateLineChart({ data = DEFAULT_RATE_SERIES, className }: Props) {
  // Ukur container sendiri lalu beri LineChart ukuran piksel konkret.
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  // Animasi: garis tergambar dulu, lalu titik sentimen "pop". Saat reduced
  // motion semuanya tampil langsung tanpa gerak — titik tak perlu menunggu.
  const reduce = usePrefersReducedMotion();
  const [drawn, setDrawn] = useState(false);
  const showMarkers = reduce || drawn;

    const yDomain = useMemo<[number, number]>(() => {
    const rates = data.map((d) => d.rate);
    const min = Math.min(...rates);
    const max = Math.max(...rates);
    // Padding proporsional terhadap rentang data, bukan angka tetap — ±40
    // pas untuk kurs berskala ribuan (IDR), tapi bikin kurs berskala kecil
    // (MYR ~4, EUR/USD ~0.9) tampak rata/stagnan karena paddingnya jauh
    // lebih besar dari variasi datanya sendiri.
    const padding = (max - min) * 0.15 || Math.abs(max) * 0.02 || 1;
    return [min - padding, max + padding];
  }, [data]);

  const markers = useMemo(
    () =>
      data.filter(
        (d): d is ChartPoint & { sentiment: Sentiment } => Boolean(d.sentiment),
      ),
    [data],
  );

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => setDrawn(true), DRAW_MS);
    return () => clearTimeout(t);
  }, [reduce]);

  return (
    <div
      ref={wrapRef}
      className={`h-40 w-full ${className ?? ""}`}
      role="img"
      aria-label="Grafik kurs 30 hari terakhir dengan titik sentimen berita"
    >
      {size.width > 0 && size.height > 0 && (
        <LineChart
          width={size.width}
          height={size.height}
          data={data}
          margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
        >
          <CartesianGrid vertical={false} stroke="var(--color-line)" strokeDasharray="2 4" />

          <XAxis
            dataKey="day"
            interval={3}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 9, fontFamily: "monospace", fill: "var(--color-muted)" }}
            tickMargin={6}
          />

          <YAxis
            orientation="right"
            domain={yDomain}
            tickCount={4}
            width={46}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 9, fontFamily: "monospace", fill: "var(--color-muted)" }}
            tickFormatter={formatRate}
          />

          <Tooltip
            cursor={{ stroke: "var(--color-line)", strokeWidth: 1 }}
            content={<CustomTooltip />}
          />

          <Line
            type="linear"
            dataKey="rate"
            stroke="var(--color-ink)"
            strokeWidth={2.4}
            dot={false}
            isAnimationActive={!reduce}
            animationDuration={DRAW_MS}
            animationEasing="ease-out"
            activeDot={{ r: 5, fill: "var(--color-ink)", stroke: "var(--color-surface)", strokeWidth: 2 }}
          />

          {/* Titik sentimen berita — muncul "pop" setelah garis tergambar. */}
          {showMarkers &&
            markers.map((m, i) => (
              <ReferenceDot
                key={m.day}
                x={m.day}
                y={m.rate}
                r={5.5}
                fill={SENTIMENT[m.sentiment].color}
                stroke="var(--color-surface)"
                strokeWidth={2.5}
                ifOverflow="extendDomain"
                className={reduce ? undefined : "sentiment-dot"}
                style={reduce ? undefined : { animationDelay: `${i * 130}ms` }}
              />
            ))}
        </LineChart>
      )}
    </div>
  );
}
