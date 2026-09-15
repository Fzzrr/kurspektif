import type { ReactNode, CSSProperties } from 'react';

// "Cangkang" kartu yang dipakai berulang di dashboard (kartu statistik, grafik,
// berita, alert, dst). Diambil dari shell yang sama seperti RateCard di landing
// page, supaya tampilan kartu konsisten di seluruh aplikasi tanpa menyalin
// string class yang sama berkali-kali di tiap komponen.
type Props = {
  children: ReactNode;
  className?: string;
  /** Varian latar tinted untuk kartu highlight (mis. "Yang menggerakkan rupiah"). */
  tint?: boolean;
  style?: CSSProperties;
};

export default function DashboardCard({ children, className = '', tint = false, style }: Props) {
  return (
    <div
      style={style}
      className={`rounded-2xl border border-line p-5 text-ink shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_20px_50px_-30px_rgba(0,0,0,0.8)] transition-[border-color,transform,box-shadow] duration-200 ${
        tint ? 'bg-accent-soft/50' : 'bg-surface'
      } ${className}`}
    >
      {children}
    </div>
  );
}
