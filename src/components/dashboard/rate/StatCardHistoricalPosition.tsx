// Kartu posisi historis. Server Component murni — tidak ada state; posisi
// marker dan lebar isian dihitung dari props.
import DashboardCard from '../ui/DashboardCard';

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
  const clamped = Math.max(0, Math.min(100, percentile));
  // Dekat tertinggi = mahal (merah), dekat terendah = murah (hijau), tengah
  // netral — arah yang lazim dibaca pembeli valuta asing.
  const tone = clamped >= 70 ? 'bg-down' : clamped <= 30 ? 'bg-up' : 'bg-ink';

  return (
    <DashboardCard className="flex flex-col">
      <p className="font-mono text-xs text-muted">Posisi historis</p>
      <span className="mt-3 inline-block self-start rounded-full bg-accent-soft px-3 py-1 font-mono text-xs text-accent">
        {label}
      </span>

      {/* Track: bagian kiri terisi sampai posisi marker; label persen mengambang
          di atas marker. Posisi memakai `left` dalam persen — transisi supaya
          marker meluncur saat pasangan diganti, bukan lompat. */}
      <div className="relative mt-auto pt-9">
        <span
          className="absolute top-1 -translate-x-1/2 rounded-full bg-accent-soft px-1.5 py-0.5 font-mono text-[10px] text-ink transition-[left] duration-500"
          style={{ left: `${clamped}%` }}
        >
          {clamped}%
        </span>
        <div className="relative h-1.5 overflow-hidden rounded-full bg-line">
          <span
            className={`absolute inset-y-0 left-0 rounded-full ${tone} opacity-60 transition-[width] duration-500`}
            style={{ width: `${clamped}%` }}
          />
        </div>
        <span
          className={`absolute bottom-0 size-3.5 -translate-x-1/2 translate-y-1/4 rounded-full border-2 border-surface ${tone} shadow-[0_0_0_3px_rgba(255,255,255,0.08)] transition-[left] duration-500`}
          style={{ left: `${clamped}%` }}
        />
      </div>

      <div className="mt-3 flex justify-between font-mono text-[10px]">
        <div>
          <p className="text-muted">Terendah 90 hari</p>
          <p className="mt-0.5 text-ink">{min}</p>
        </div>
        <div className="text-right">
          <p className="text-muted">Tertinggi 90 hari</p>
          <p className="mt-0.5 text-ink">{max}</p>
        </div>
      </div>
    </DashboardCard>
  );
}
