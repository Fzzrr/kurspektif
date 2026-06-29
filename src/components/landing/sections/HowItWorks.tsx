import Reveal from "../motion/Reveal";

// Penomoran 01/02/03 dipakai karena ini benar-benar urutan langkah,
// bukan sekadar hiasan.
const steps = [
  {
    num: "01",
    title: "Pilih mata uang",
    desc: "Tentukan pasangan apa pun — USD/IDR, EUR/JPY, atau lainnya.",
  },
  {
    num: "02",
    title: "Lihat grafik & berita",
    desc: "Pantau pergerakan kurs sekaligus berita yang sudah ditandai sentimen.",
  },
  {
    num: "03",
    title: "Pahami kenapa",
    desc: "Baca rangkuman pekan ini dan keputusan jadi lebih jernih.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="cara"
      className="border-y border-line bg-surface"
    >
      <div className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
            Cara kerja
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight">
            Tiga langkah, lalu kamu yang menyimpulkan
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-7 md:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal key={step.num} delay={i * 110}>
              <div className="group border-t-2 border-ink pt-4 transition-colors duration-300 hover:border-accent">
                <p className="font-mono text-sm text-accent transition-transform duration-300 group-hover:translate-x-1">
                  {step.num}
                </p>
                <h3 className="mt-2 font-display text-lg font-semibold">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted">{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
