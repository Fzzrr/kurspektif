const before = [
  "Menampilkan kurs hari ini",
  "Menampilkan grafik historis",
  "Tidak menjelaskan kenapa kurs bergerak",
  "Tidak ada konteks berita",
  "Tidak ada perspektif historis",
];

const after = [
  "Berita ditandai sentimen positif / netral / negatif",
  "Rangkuman mingguan kenapa kurs bergerak",
  "Konteks historis — mahal atau murah?",
  "Alert yang membawa alasan, bukan cuma angka",
  "Berlaku untuk pasangan mata uang apa pun",
];

export default function Comparison() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="grid overflow-hidden rounded-2xl border border-line md:grid-cols-2">
        {/* Konverter biasa */}
        <div className="bg-surface p-8">
          <p className="font-mono text-xs uppercase tracking-wider text-muted">
            Konverter biasa
          </p>
          <h3 className="mt-2 font-display text-xl font-semibold">
            Berhenti di angka.
          </h3>
          <ul className="mt-4 space-y-2.5">
            {before.map((item) => (
              <li key={item} className="flex gap-3 text-sm text-muted">
                <span className="font-mono text-line">—</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Kurspektif */}
        <div className="bg-ink p-8 text-paper">
          <p className="font-mono text-xs uppercase tracking-wider text-accent">
            Kurspektif
          </p>
          <h3 className="mt-2 font-display text-xl font-semibold text-white">
            Memberi alasan.
          </h3>
          <ul className="mt-4 space-y-2.5">
            {after.map((item) => (
              <li key={item} className="flex gap-3 text-sm text-[#c7d2cb]">
                <span className="font-mono text-accent">✦</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
