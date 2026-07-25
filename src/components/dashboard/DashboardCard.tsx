import type { ReactNode } from 'react';

// "Cangkang" kartu yang dipakai berulang di dashboard (kartu statistik, grafik,
// berita, alert, dst). Diambil dari shell yang sama seperti RateCard di landing
// page, supaya tampilan kartu konsisten di seluruh aplikasi tanpa menyalin
// string class yang sama berkali-kali di tiap komponen.
type Props = {
  children: ReactNode;
  className?: string;
  /** Varian latar tinted untuk kartu highlight (mis. "Yang menggerakkan rupiah"). */
  tint?: boolean;
};

export default function DashboardCard({ children, className = '', tint = false }: Props) {
  return (
    <div
      className={`rounded-2xl border border-line p-5 text-ink shadow-[0_18px_40px_-28px_rgba(14,31,26,0.5)] ${
        tint ? 'bg-accent-soft/50' : 'bg-surface'
      } ${className}`}
    >
      {children}
    </div>
  );
}
