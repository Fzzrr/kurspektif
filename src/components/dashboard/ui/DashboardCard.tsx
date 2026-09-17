import type { ReactNode, CSSProperties } from 'react';

// "Cangkang" kartu yang dipakai berulang di dashboard (kartu statistik, grafik,
// berita, alert, dst). Diambil dari shell yang sama seperti RateCard di landing
// page, supaya tampilan kartu konsisten di seluruh aplikasi tanpa menyalin
// string class yang sama berkali-kali di tiap komponen.
type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export default function DashboardCard({ children, className = '', style }: Props) {
  return (
    <div
      style={style}
      className={`rounded-2xl p-5 text-ink transition-[background-color,transform] duration-200 ${className}`}
    >
      {children}
    </div>
  );
}
