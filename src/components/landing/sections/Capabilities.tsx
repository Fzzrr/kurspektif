import Reveal from "../motion/Reveal";

// Daftar kemampuan diset sebesar poster: nama di kiri, satu kalimat di kanan
// sejajar baseline-nya. Judul section adalah baris pertama daftar itu sendiri.
const items = [
  { name: "Penggerak mingguan", desc: "Sisi mana yang benar‑benar bergerak, dihitung dari kurs terhadap enam mata uang utama." },
  { name: "Agenda bank sentral", desc: "Jadwal keputusan The Fed, ECB, Bank of England, Bank of Japan, dan Bank Indonesia." },
  { name: "Berita & sentimen", desc: "Berita pasar mata uang dari media global dan Indonesia, masing-masing ditandai sentimennya." },
  { name: "165 mata uang", desc: "Pasangan apa pun, dari EUR/USD sampai yang jarang dilirik, dengan grafik sampai setahun." },
  { name: "Mahal atau murah", desc: "Posisi kurs hari ini dibanding 90 hari kerja terakhir." },
  { name: "Alert ke email", desc: "Kabar saat kurs melewati batasmu, atau masuk 20% hari termurah setahun." },
  { name: "Ringkasan Senin", desc: "Pergerakan pasangan yang kamu simpan, dikirim tiap Senin pagi." },
];

const nameClass = "text-[clamp(36px,5.2vw,84px)] font-semibold leading-none tracking-[-0.035em]";

export default function Capabilities() {
  return (
    <section id="fitur" className="px-5 py-28 sm:px-10 sm:py-44">
      <h2 className={`${nameClass} text-muted`}>Yang kamu dapat</h2>
      <ul className="mt-[0.35em] space-y-7 md:space-y-[0.35em] [&:hover>li_.cap-name]:text-muted">
        {items.map((item, i) => (
          <li key={item.name} className="group">
            <Reveal delay={i * 70} className="grid items-baseline gap-2 md:grid-cols-12 md:gap-6">
              <span className={`cap-name md:col-span-8 ${nameClass} transition-colors group-hover:!text-ink`}>
                {item.name}
              </span>
              <span className="pl-4 text-[17px] leading-snug md:col-span-4 md:pl-0">{item.desc}</span>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
