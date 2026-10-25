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
import { HERO_CODES, LIST_CODES, loadLandingData } from "@/lib/landing";

// Kurs referensi terbit sekali sehari — cukup render ulang tiap jam.
export const revalidate = 3600;

export default async function Home() {
  const data = await loadLandingData();
  const pick = (codes: string[]) =>
    codes.flatMap((code) => data.pairs.filter((pair) => pair.code === code));

  return (
    <>
      <Navbar />
      <main>
        <Hero pairs={pick(HERO_CODES)} />
        {data.usdIdr && <WhoMoved movers={data.usdIdr} />}
        <Capabilities />
        <Reasons movers={data.usdIdr} agenda={data.agenda} news={data.news} />
        <ArchiveBand />
        {data.position && <Position position={data.position} />}
        <RatesPoster pairs={pick(LIST_CODES)} />
        <CtaBand />
      </main>
      <Footer showCredits />
    </>
  );
}
