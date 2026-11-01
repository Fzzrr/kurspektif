'use client';

import { useEffect } from 'react';
import Link from 'next/link';

// Error di dalam dashboard: sidebar tetap tampil (layout tidak ikut gagal),
// hanya isi halaman yang diganti pesan ini.
export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-[34px] font-semibold leading-tight tracking-[-0.02em]">Ada yang tidak beres</h1>
      <section className="mt-8 max-w-2xl rounded-2xl bg-surface p-6">
        <p className="text-[15px] leading-relaxed">
          Halaman ini gagal dimuat. Biasanya karena sumber data kurs sedang lambat atau sesimu sudah berakhir. Datamu
          tetap aman.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="h-10 bg-ink px-4 text-sm font-medium text-paper hover:opacity-90"
          >
            Coba lagi
          </button>
          <Link href="/login" className="flex h-10 items-center bg-accent-soft px-4 text-sm text-ink hover:bg-line">
            Masuk lagi
          </Link>
        </div>
        {error.digest && <p className="mt-6 font-mono text-xs text-muted">Kode kejadian: {error.digest}</p>}
      </section>
    </div>
  );
}
