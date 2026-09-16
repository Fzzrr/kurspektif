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
      className={`glass rounded-2xl p-5 text-ink transition-[border-color,transform,box-shadow] duration-200 ${
        tint ? 'border-white/20' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
