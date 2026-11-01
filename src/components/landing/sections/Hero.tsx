import type { PairSnapshot } from "@/lib/landing";
import HeroAlert from "./HeroAlert";

// Layar pertama menjual pemantauan + alert (Kurspektif bukan tempat menukar
// uang). Judulnya kalimat alert yang bisa diatur langsung lewat chip di
// sekelilingnya — lihat HeroAlert.
export default function Hero({ pairs }: { pairs: PairSnapshot[] }) {
  return (
    <section
      data-field
      className="flex overflow-hidden bg-paper px-5 py-14 text-ink sm:px-10 lg:min-h-[calc(100svh-4rem)] lg:items-center lg:py-10"
    >
      <HeroAlert pairs={pairs} />
    </section>
  );
}
