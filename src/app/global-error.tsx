'use client';

import './globals.css';

// Cadangan terakhir kalau root layout sendiri gagal: menggantikan seluruh
// <html>, jadi tanpa navbar dan tanpa font dari layout.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="id">
      <body className="flex min-h-screen items-center bg-paper px-5 text-ink sm:px-10">
        <main className="max-w-2xl">
          <h1 className="text-[clamp(36px,5vw,64px)] font-black leading-[0.95] tracking-[-0.04em]">Kurspektif sedang bermasalah</h1>
          <p className="mt-5 text-[17px] leading-relaxed">Coba muat ulang halaman ini beberapa saat lagi.</p>
          <button
            type="button"
            onClick={reset}
            className="mt-8 h-11 bg-ink px-5 text-[15px] font-medium text-paper hover:bg-muted"
          >
            Coba lagi
          </button>
          {error.digest && <p className="mt-8 font-mono text-xs text-muted">Kode kejadian: {error.digest}</p>}
        </main>
      </body>
    </html>
  );
}
