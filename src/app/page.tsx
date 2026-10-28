import Navbar from "@/components/landing/sections/Navbar";
import Hero from "@/components/landing/sections/Hero";
import WhoMoved from "@/components/landing/sections/WhoMoved";
import Capabilities from "@/components/landing/sections/Capabilities";
import Reasons from "@/components/landing/sections/Reasons";
import ArchiveBand from "@/components/landing/sections/ArchiveBand";
import Position from "@/components/landing/sections/Position";
import RatesPoster from "@/components/landing/sections/RatesPoster";
import CtaBand from "@/components/landing/sections/CtaBand";
import Footer from "@/components/landing/sections/Footer";
import { HERO_PAIRS, LIST_PAIRS, loadLandingData } from "@/lib/landing";

// Kurs referensi terbit sekali sehari — cukup render ulang tiap jam.
export const revalidate = 3600;

export default async function Home() {
  const data = await loadLandingData();
  const pick = (pairs: string[]) => pairs.flatMap((pair) => data.pairs.filter((p) => p.pair === pair));
  const featured = data.featured?.movers ? { pair: data.featured.pair, movers: data.featured.movers } : null;

  return (
    <>
      <Navbar />
      <main>
        <Hero pairs={pick(HERO_PAIRS)} initial={featured?.pair} />
        {featured && <WhoMoved pair={featured.pair} movers={featured.movers} />}
        <Capabilities />
        <Reasons movers={featured?.movers ?? null} news={data.news} />
        <ArchiveBand />
        {data.position && <Position position={data.position} />}
        <RatesPoster rows={pick(LIST_PAIRS)} />
        <CtaBand />
      </main>
      <Footer showCredits />
    </>
  );
}
