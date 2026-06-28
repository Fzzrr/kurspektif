import Reveal from "./Reveal";

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
      <Reveal>
        <div className="grid overflow-hidden rounded-2xl border border-line md:grid-cols-2">
          {/* Konverter biasa */}
          <div className="bg-surface p-6 sm:p-8">
            <p className="font-mono text-xs uppercase tracking-wider text-muted">
              Konverter biasa
            </p>
            <h3 className="mt-2 font-display text-xl font-semibold">
              Berhenti di angka.
            </h3>
            <ul className="mt-4 space-y-2.5">
              {before.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm text-muted transition-colors hover:text-ink"
                >
                  <span className="font-mono text-line">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Kurspektif */}
          <div className="relative overflow-hidden bg-ink p-6 text-paper sm:p-8">
            <div
              aria-hidden
              className="animate-glow pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent/20 blur-3xl"
            />
            <p className="relative font-mono text-xs uppercase tracking-wider text-accent">
              Kurspektif
            </p>
            <h3 className="relative mt-2 font-display text-xl font-semibold text-white">
              Memberi alasan.
            </h3>
            <ul className="relative mt-4 space-y-2.5">
              {after.map((item) => (
                <li
                  key={item}
                  className="group flex gap-3 text-sm text-[#c7d2cb] transition-colors hover:text-white"
                >
                  <span className="font-mono text-accent transition-transform duration-300 group-hover:scale-125">
                    ✦
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
