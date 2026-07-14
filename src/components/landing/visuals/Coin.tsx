"use client";

// Coin: keping emas dengan glyph mata uang. Motif "uang" utama landing page.
// Digambar murni SVG (tajam di semua ukuran) dengan gradien emas + tepi
// bergerigi (reeded edge) dan glyph yang di-emboss — detail kecil yang
// membuatnya terasa dibuat, bukan template.
//
// id gradien dibuat unik per instance (useId) agar banyak koin dalam satu
// halaman tidak saling menimpa definisi gradiennya.

import { useId } from "react";

type CoinProps = {
  /** Simbol mata uang di muka koin: $, €, ¥, dst. */
  glyph: string;
  /** Kode pendek yang tercetak melengkung di bawah glyph (opsional). */
  code?: string;
  className?: string;
};

export default function Coin({ glyph, code, className }: CoinProps) {
  const id = useId();
  const face = `face-${id}`;
  const rim = `rim-${id}`;
  const sheen = `sheen-${id}`;

  return (
    <svg
      viewBox="0 0 100 100"
      className={`block h-auto w-full ${className ?? ""}`}
      role="img"
      aria-label={code ? `Koin ${code}` : "Koin mata uang"}
    >
      <defs>
        {/* Muka koin: sorotan di kiri-atas meluruh ke emas gelap di kanan-bawah. */}
        <radialGradient id={face} cx="38%" cy="32%" r="78%">
          <stop offset="0%" stopColor="#f6e6ad" />
          <stop offset="42%" stopColor="#d9b968" />
          <stop offset="78%" stopColor="#b8902a" />
          <stop offset="100%" stopColor="#8a6b1c" />
        </radialGradient>
        {/* Cincin tepi: gradien linear agar sisi atas terang, bawah teduh. */}
        <linearGradient id={rim} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e7c876" />
          <stop offset="100%" stopColor="#7a5d18" />
        </linearGradient>
        {/* Kilau lembut melintang di muka koin. */}
        <linearGradient id={sheen} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="35%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Tepi bergerigi (reeded edge) — garis putus-putus tebal meniru gerigi koin. */}
      <circle
        cx="50"
        cy="50"
        r="46"
        fill="none"
        stroke="#8a6b1c"
        strokeWidth="6"
        strokeDasharray="2 2.3"
      />
      {/* Cincin tepi utama */}
      <circle cx="50" cy="50" r="47" fill={`url(#${rim})`} />
      {/* Muka koin */}
      <circle cx="50" cy="50" r="40" fill={`url(#${face})`} />
      {/* Alur cincin dalam (kesan timbul) */}
      <circle cx="50" cy="50" r="34" fill="none" stroke="#8a6b1c" strokeOpacity="0.5" strokeWidth="1.2" />
      <circle cx="50" cy="50" r="33" fill="none" stroke="#f6e6ad" strokeOpacity="0.4" strokeWidth="1" />

      {/* Glyph mata uang — di-emboss: bayangan gelap + sorotan terang sedikit bergeser. */}
      <text
        x="50"
        y={code ? "47" : "50"}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-jetbrains), monospace"
        fontWeight="700"
        fontSize="38"
        fill="#6e5415"
      >
        {glyph}
      </text>
      <text
        x="49.3"
        y={code ? "46.3" : "49.3"}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-jetbrains), monospace"
        fontWeight="700"
        fontSize="38"
        fill="#fbf1c9"
        fillOpacity="0.85"
      >
        {glyph}
      </text>

      {code && (
        <text
          x="50"
          y="68"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="var(--font-jetbrains), monospace"
          fontWeight="600"
          fontSize="11"
          letterSpacing="1"
          fill="#6e5415"
        >
          {code}
        </text>
      )}

      {/* Lapisan kilau di atas semua */}
      <circle cx="50" cy="50" r="40" fill={`url(#${sheen})`} />
    </svg>
  );
}
