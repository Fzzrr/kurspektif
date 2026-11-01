// Kerangka saat halaman dashboard memuat data di server (kurs, berita,
// Pantauan). Bentuknya mengikuti tata letak asli: judul, baris ringkasan,
// lalu dua kartu — supaya tidak ada lompatan saat isi asli tiba.
export default function DashboardLoading() {
  const block = 'rounded-2xl bg-surface';
  return (
    <div className="mx-auto max-w-6xl animate-pulse" role="status" aria-label="Memuat halaman">
      <div className="h-10 w-56 rounded-lg bg-surface" />
      <div className="mt-3 h-4 w-80 max-w-full rounded bg-surface" />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className={`${block} h-28`} />
        <div className={`${block} h-28`} />
        <div className={`${block} h-28`} />
      </div>
      <div className={`${block} mt-4 h-72`} />
      <div className={`${block} mt-4 h-40`} />
    </div>
  );
}
