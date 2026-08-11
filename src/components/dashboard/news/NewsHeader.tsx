export default function NewsHeader() {
  return (
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Berita</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Berita finansial dunia.</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Mata uang, ekonomi makro, kebijakan bank sentral, dan komoditas — setiap berita ditandai
          sentimen agar kamu bisa membaca arah, bukan cuma judul.
        </p>
      </div>
  );
}