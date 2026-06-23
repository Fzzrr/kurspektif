// Ikon ditulis sebagai komponen kecil agar daftar fitur tetap rapi.
const icons = {
  chart: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17l5-5 3 3 8-8" />
    </svg>
  ),
  summary: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16M4 12h12M4 18h8" />
    </svg>
  ),
  bars: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20V10M6 20v-6M18 20V6" />
    </svg>
  ),
  bell: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  ),
};

const features = [
  {
    icon: icons.chart,
    title: "Sentimen menempel di grafik",
    desc: "Titik warna di chart menandai hari saat berita penting terbit — kamu bisa langsung mengaitkan gerakan kurs dengan peristiwa.",
  },
  {
    icon: icons.summary,
    title: "Rangkuman mingguan",
    desc: "Satu paragraf yang menjelaskan, dalam bahasa manusia, kenapa rupiah bergerak ke arah tertentu pekan ini.",
  },
  {
    icon: icons.bars,
    title: "Konteks mahal atau murah",
    desc: "Indikator persentil 90 hari membantumu memahami posisi kurs hari ini relatif terhadap rentang historisnya.",
  },
  {
    icon: icons.bell,
    title: "Alert yang membawa alasan",
    desc: "Saat kurs menembus ambang, notifikasi juga menyertakan berita yang kemungkinan jadi pemicunya.",
  },
];

export default function Features() {
  return (
    <section id="fitur" className="mx-auto max-w-6xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
        Fitur
      </p>
      <h2 className="mt-3 max-w-xl font-display text-3xl font-semibold tracking-tight">
        Konteks yang tidak diberikan konverter lain
      </h2>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-line bg-surface p-6 transition-transform hover:-translate-y-1"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
              {feature.icon}
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm text-muted">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
