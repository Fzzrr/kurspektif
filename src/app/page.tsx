import Navbar from "@/components/landing/sections/Navbar";
import Hero from "@/components/landing/sections/Hero";
import PairLookup from "@/components/landing/sections/PairLookup";
import InboxDemo from "@/components/landing/sections/InboxDemo";
import ExchangeStrip from "@/components/landing/sections/ExchangeStrip";
import NewsDeck from "@/components/landing/sections/NewsDeck";
import RatesPoster from "@/components/landing/sections/RatesPoster";
import CtaBand from "@/components/landing/sections/CtaBand";
import Footer from "@/components/landing/sections/Footer";
import { HERO_PAIRS, LIST_PAIRS, loadLandingData } from "@/lib/landing";

// Kurs referensi terbit sekali sehari — cukup render ulang tiap jam.
export const revalidate = 3600;

// Tiap bab satu produk, tiap bab satu bidang warna penuh: coba kursnya, lihat
// email Pantauan & alert, Catatan tukar, berita, lalu daftar kurs utama.
export default async function Home() {
  const data = await loadLandingData();
  const pick = (pairs: string[]) => pairs.flatMap((pair) => data.pairs.filter((p) => p.pair === pair));
  const idr = data.pairs.find((p) => p.pair === "USD/IDR");

  return (
    <>
      <Navbar />
      <main>
        <Hero pairs={pick(HERO_PAIRS)} />
        <PairLookup pairs={data.pairs} initial={data.featured?.pair ?? "USD/IDR"} />
        <InboxDemo pairs={pick(LIST_PAIRS)} />
        {idr?.rate && idr.date && <ExchangeStrip midRate={idr.rate} midDate={idr.date} />}
        {data.news.length > 0 && <NewsDeck news={data.news} />}
        <div data-field className="bg-surface text-ink">
          <RatesPoster rows={pick(LIST_PAIRS)} />
        </div>
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
