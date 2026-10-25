// Header halaman: judul di kiri, sumber & tanggal kurs di kanan.
// Server Component murni (tidak ada state/efek) — beda tata letak dari
// SectionHeading milik landing page (yang selalu menumpuk ke bawah), jadi
// dibuat baru alih-alih dipaksakan reuse.
type Props = {
  title: string;
  updatedAt: string;
};

export default function DashboardHeader({ title, updatedAt }: Props) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-3">
      <h1 className="text-[34px] font-semibold leading-tight tracking-[-0.02em]">{title}</h1>
      <p className="text-sm text-muted tabular-nums">{updatedAt}</p>
    </div>
  );
}
