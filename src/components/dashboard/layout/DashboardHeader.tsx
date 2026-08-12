// Header halaman: eyebrow + judul di kiri, timestamp "Diperbarui ..." di kanan.
// Server Component murni (tidak ada state/efek) — beda tata letak dari
// SectionHeading milik landing page (yang selalu menumpuk ke bawah), jadi
// dibuat baru alih-alih dipaksakan reuse.
type Props = {
  title: string;
  eyebrow?: string;
  updatedAt: string;
};

export default function DashboardHeader({ title, eyebrow = 'Dashboard', updatedAt }: Props) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{eyebrow}</p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight">{title}</h1>
      </div>
      <p className="font-mono text-xs text-muted">Diperbarui {updatedAt}</p>
    </div>
  );
}
