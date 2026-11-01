"use client";

// Judul hero adalah alert itu sendiri: "USD/IDR 17.780? Kami kabari." Tiga
// chip di sekelilingnya adalah kontrol alert dari aplikasi (pasangan, batas,
// arah) dan benar-benar bekerja — menggeser batas mengubah angka di judul,
// kalimat di bawahnya menghitung jarak dari kurs hari ini (data asli).
import { useState, type ReactNode } from "react";
import Link from "next/link";
import type { PairSnapshot } from "@/lib/landing";
import { currencyToFlag } from "@/lib/flags";
import { fmtAbsPct } from "@/lib/moversText";
import { formatRate } from "@/lib/rateStats";
import { lead } from "../type";

type Direction = "bawah" | "atas";

const flags = (pair: string) => pair.split("/").map((code) => currencyToFlag(code) ?? "").join("");
// Batas awal: 2% dari kurs hari ini ke arah yang ditunggu.
const startLimit = (rate: number, direction: Direction) => rate * (direction === "bawah" ? 0.98 : 1.02);

function Chip({ label, value, className = "", children }: { label: string; value: ReactNode; className?: string; children: ReactNode }) {
  return (
    <div
      data-ui
      className={`w-full rounded-2xl bg-surface p-4 transition-transform duration-300 ease-snap hover:rotate-0 sm:w-[300px] ${className}`}
    >
      <p className="flex items-baseline justify-between gap-3 text-[13px] text-muted">
        {label}
        <span className="text-[15px] font-semibold tabular-nums text-ink">{value}</span>
      </p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export default function HeroAlert({ pairs, initial = "USD/IDR" }: { pairs: PairSnapshot[]; initial?: string }) {
  const usable = pairs.filter((p) => p.rate !== null && p.series.length > 1);
  const startIndex = Math.max(0, usable.findIndex((p) => p.pair === initial));
  const [index, setIndex] = useState(startIndex);
  const [direction, setDirection] = useState<Direction>("bawah");
  // Batas yang digeser disimpan per pasangan + arah; sisanya memakai batas awal.
  const [limits, setLimits] = useState<Record<string, number>>({});
  const current = usable[index];
  if (!current?.rate) return null;

  // Rentang slider: kurs ~30 hari terakhir dengan ruang 3% di kedua sisi.
  const rates = current.series.map((p) => p.rate);
  const lo = Math.min(...rates) * 0.97;
  const hi = Math.max(...rates) * 1.03;
  const step = 10 ** Math.floor(Math.log10(hi - lo)) / 100;
  const snap = (value: number) => Math.round(value / step) * step;
  const key = `${current.pair}|${direction}`;
  const limit = limits[key] ?? snap(startLimit(current.rate, direction));
  const reached = direction === "bawah" ? current.rate <= limit : current.rate >= limit;
  const gap = fmtAbsPct((limit / current.rate - 1) * 100);

  function move(delta: number) {
    setIndex((i) => (i + delta + usable.length) % usable.length);
  }

  return (
    <div className="hero-after mx-auto flex w-full max-w-[1360px] flex-col gap-10 lg:gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <Chip label="Pasangan" value={current.pair} className="sm:-rotate-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Pasangan sebelumnya"
              className="flex size-10 items-center justify-center rounded-lg bg-accent-soft text-[18px] hover:bg-line"
            >
              ‹
            </button>
            <span aria-hidden className="flex-1 text-center text-[24px] leading-none">
              {flags(current.pair)}
            </span>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Pasangan berikutnya"
              className="flex size-10 items-center justify-center rounded-lg bg-accent-soft text-[18px] hover:bg-line"
            >
              ›
            </button>
          </div>
        </Chip>

        <Chip label="Batas" value={<span className="text-up">{formatRate(limit)}</span>} className="sm:mt-16 sm:rotate-2">
          <input
            type="range"
            min={snap(lo)}
            max={snap(hi)}
            step={step}
            value={limit}
            onChange={(event) => setLimits((all) => ({ ...all, [key]: Number(event.target.value) }))}
            aria-label={`Batas alert ${current.pair}`}
            aria-valuetext={formatRate(limit)}
            className="h-10 w-full cursor-pointer accent-up"
          />
        </Chip>
      </div>

      <h1 className="text-center text-[clamp(44px,8vw,128px)] font-black leading-none tracking-[-0.04em]">
        <span className="block tabular-nums">
          {current.pair} <span className="text-up">{formatRate(limit)}</span>?
        </span>
        <span className="block">Kami kabari.</span>
      </h1>

      <div className="relative flex flex-col items-center gap-6 text-center">
        <p className={`max-w-[44ch] ${lead}`}>
          Kurspektif memantau 165 mata uang tiap pagi dan mengirim email begitu kurs menyentuh angkamu.
        </p>

        {/* Status alert yang sedang diatur di chip: kurs hari ini, batasnya, dan jaraknya. */}
        <dl data-ui aria-live="polite" className="grid w-full max-w-[560px] grid-cols-3 gap-1 text-left tabular-nums">
          <div className="rounded-l-2xl bg-surface px-4 py-3 sm:px-5">
            <dt className="text-[13px] text-muted">Kurs hari ini</dt>
            <dd className="mt-1 text-[17px] font-semibold leading-tight sm:text-[20px]">{formatRate(current.rate)}</dd>
          </div>
          <div className="bg-surface px-4 py-3 sm:px-5">
            <dt className="text-[13px] text-muted">Batasmu</dt>
            <dd className="mt-1 text-[17px] font-semibold leading-tight sm:text-[20px] text-up">{formatRate(limit)}</dd>
          </div>
          <div className="rounded-r-2xl bg-surface px-4 py-3 sm:px-5">
            <dt className="text-[13px] text-muted">{reached ? "Status" : "Jarak"}</dt>
            <dd className={`mt-1 text-[17px] font-semibold leading-tight sm:text-[20px] ${reached ? "text-up" : ""}`}>
              {reached ? "Tersentuh" : `${direction === "bawah" ? "↓" : "↑"} ${gap}`}
            </dd>
          </div>
        </dl>
        <p className="-mt-3 text-[14px] text-muted">
          {reached
            ? "Email dikirim pada pengecekan berikutnya, pukul 08.00 WIB."
            : `Email dikirim begitu ${current.pair} ${direction === "bawah" ? "turun" : "naik"} ${gap} lagi.`}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <Link href="/register" className="press bg-ink px-6 py-4 text-[17px] font-semibold text-paper hover:bg-muted">
            Pasang alert gratis
          </Link>
          <Link href="#coba" className="link-line text-[17px] font-medium">
            Coba dulu tanpa akun
          </Link>
        </div>

        <Chip label="Kabari saat" value={direction === "bawah" ? "Turun" : "Naik"} className="lg:absolute lg:bottom-0 lg:right-0 lg:-rotate-2">
          <div role="radiogroup" aria-label="Arah alert" className="flex gap-1 rounded-xl bg-paper p-1">
            {(["bawah", "atas"] as const).map((d) => (
              <button
                key={d}
                type="button"
                role="radio"
                aria-checked={direction === d}
                onClick={() => setDirection(d)}
                className="min-h-10 flex-1 rounded-lg text-[15px] font-medium aria-checked:bg-ink aria-checked:text-paper aria-[checked=false]:hover:bg-accent-soft"
              >
                {d === "bawah" ? "Turun ke batas" : "Naik ke batas"}
              </button>
            ))}
          </div>
        </Chip>
      </div>
    </div>
  );
}
