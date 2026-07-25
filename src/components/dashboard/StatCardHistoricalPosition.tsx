// Kartu posisi historis. Server Component murni — angka tetap (mock), tidak
// ada interaksi, jadi tidak perlu 'use client'.
import DashboardCard from './DashboardCard';

type Props = {
  label?: string;
  min?: string;
  max?: string;
  /** Posisi kurs saat ini di antara min-max, dalam persen (0-100). */
  percentile?: number;
};

export default function StatCardHistoricalPosition({
  label = 'Lebih tinggi dari 82% hari (90 hari terakhir)',
  min = '15.420',
  max = '16.280',
  percentile = 82,
}: Props) {
  return (
    <DashboardCard>
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Posisi historis</p>
      <span className="mt-3 inline-block rounded-full bg-accent-soft px-3 py-1 text-xs text-accent">
        {label}
      </span>

      {/* Bar posisi: titik ditempatkan lewat `left` dalam persen, dihitung
          dari percentile — teknik yang sama seperti ReferenceDot di grafik. */}
      <div className="relative mt-4 h-1.5 rounded-full bg-line">
        <span
          className="absolute top-1/2 size-3 -translate-y-1/2 rounded-full border-2 border-surface bg-accent"
          style={{ left: `${percentile}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between font-mono text-[11px] text-muted">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </DashboardCard>
  );
}
