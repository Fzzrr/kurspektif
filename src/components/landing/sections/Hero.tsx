import type { PairSnapshot } from "@/lib/landing";
import HeroRates from "./HeroRates";

// "Garis air": dua bidang bertemu tepat di tengah layar. Di atas garis, di
// bidang gelap, ada angkanya; di bawah garis, di bidang terang, alasannya.
// Satu h1 dengan mix-blend-mode difference: putih di atas bidang gelap,
// otomatis gelap di atas bidang terang — jadi baris kedua terbelah garis itu.
// Hanya bekerja karena paletnya monokrom; warna lain akan menghasilkan rona acak.
export default function Hero({ pairs, initial }: { pairs: PairSnapshot[]; initial?: string }) {
  return (
    <section className="relative h-[calc(100svh-4rem)] min-h-[600px] overflow-hidden bg-paper">
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[62%] bg-ink sm:h-1/2" />

      <h1 className="absolute inset-x-5 top-[38%] z-10 -translate-y-[75%] sm:top-1/2 text-center text-[clamp(38px,9.4vw,136px)] font-black uppercase leading-[0.86] tracking-[-0.035em] text-ink mix-blend-difference sm:inset-x-10">
        <span className="mask-line block">
          <span>Kurs dunia</span>
        </span>
        <span className="mask-line block">
          <span style={{ animationDelay: "110ms" }}>dan alasannya</span>
        </span>
      </h1>

      <div className="hero-after absolute inset-x-5 top-[calc(38%+3.5rem)] z-20 sm:inset-x-10 sm:bottom-10 sm:top-auto">
        <p className="mb-6 max-w-[52ch] text-[17px] leading-relaxed text-paper sm:mx-auto sm:text-center">
          Kurs harian 165 mata uang, dan penjelasan sisi mana yang benar‑benar menggerakkannya minggu ini.
        </p>
        <HeroRates pairs={pairs} initial={initial} />
      </div>
    </section>
  );
}
