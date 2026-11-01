import Link from 'next/link';
import PublicShell from '@/components/landing/PublicShell';

export const metadata = { title: 'Halaman tidak ditemukan', robots: { index: false } };

const titleClass = 'text-balance text-[clamp(40px,6vw,88px)] font-black leading-[0.9] tracking-[-0.04em]';
const linkClass = 'flex h-11 items-center px-5 text-[15px] font-medium';

// Dipakai untuk alamat yang tidak ada dan untuk notFound() — mis. pasangan
// /kurs/xxx-yyy yang tidak dikenal atau tanggal kurs yang tidak valid.
export default function NotFound() {
  return (
    <PublicShell cta={false}>
      <div className="max-w-3xl">
        <p className="font-mono text-[17px] text-muted">404</p>
        <h1 className={`mt-3 ${titleClass}`}>Halaman ini tidak ada</h1>
        <p className="mt-6 max-w-[56ch] text-[17px] leading-relaxed">
          Alamatnya mungkin salah ketik, sudah dipindah, atau pasangan mata uangnya tidak kami kenal. Kurs halaman
          pasangan ditulis seperti <span className="whitespace-nowrap font-mono">/kurs/usd-idr</span>, dan kurs per tanggal seperti{' '}
          <span className="whitespace-nowrap font-mono">/kurs/usd-idr/2025-01-01</span>.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className={`${linkClass} bg-ink text-paper hover:bg-muted`}>
            Ke beranda
          </Link>
          <Link href="/kurs" className={`${linkClass} bg-surface text-ink hover:bg-accent-soft`}>
            Lihat kurs hari ini
          </Link>
        </div>
      </div>
    </PublicShell>
  );
}
