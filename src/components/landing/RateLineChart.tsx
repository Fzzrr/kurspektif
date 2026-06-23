// Grafik garis statis (SVG) dengan titik sentimen.
// Dipakai di kartu hero dan pratinjau dashboard.
// Komponen presentasional murni — tidak ada data/state, jadi aman sebagai Server Component.

type Props = {
  className?: string;
};

export default function RateLineChart({ className }: Props) {
  return (
    <svg
      viewBox="0 0 460 150"
      className={className}
      role="img"
      aria-label="Grafik kurs 30 hari terakhir dengan titik sentimen berita"
    >
      <polyline
        points="0,92 50,80 100,86 150,60 200,66 250,44 300,54 350,40 400,58 460,96"
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Titik sentimen: netral, positif, negatif */}
      <circle cx="150" cy="60" r="6" fill="#888780" stroke="var(--color-surface)" strokeWidth="2.5" />
      <circle cx="250" cy="44" r="6" fill="var(--color-up)" stroke="var(--color-surface)" strokeWidth="2.5" />
      <circle cx="400" cy="58" r="6" fill="var(--color-down)" stroke="var(--color-surface)" strokeWidth="2.5" />
    </svg>
  );
}
