'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Wordmark from '@/components/ui/Wordmark';

// Batas error untuk semua halaman di luar dashboard. Komponen client, jadi
// tidak memakai PublicShell (server); cukup merek, pesan, dan jalan keluar.
export default function GlobalRouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col px-5 py-8 sm:px-10">
      <Link href="/" aria-label="Kurspektif — ke halaman utama" className="w-32">
        <Wordmark className="h-6 w-auto" />
      </Link>
      <div className="my-auto max-w-2xl py-16">
        <h1 className="text-balance text-[clamp(40px,6vw,80px)] font-black leading-[0.9] tracking-[-0.04em]">
          Ada yang tidak beres
        </h1>
        <p className="mt-6 max-w-[52ch] text-[17px] leading-relaxed">
          Halaman ini gagal dimuat, biasanya karena sumber data kurs atau berita sedang lambat. Coba lagi sebentar,
          atau kembali ke beranda.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="flex h-11 items-center bg-ink px-5 text-[15px] font-medium text-paper hover:bg-muted"
          >
            Coba lagi
          </button>
          <Link href="/" className="flex h-11 items-center bg-surface px-5 text-[15px] font-medium hover:bg-accent-soft">
            Ke beranda
          </Link>
        </div>
        {error.digest && <p className="mt-8 font-mono text-xs text-muted">Kode kejadian: {error.digest}</p>}
      </div>
    </main>
  );
}
