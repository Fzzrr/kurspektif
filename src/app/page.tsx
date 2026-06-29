import CurrencyField from "@/components/landing/visuals/CurrencyField";
import Navbar from "@/components/landing/sections/Navbar";
import Hero from "@/components/landing/sections/Hero";
import RateTicker from "@/components/landing/sections/RateTicker";
import CurrencyShowcase from "@/components/landing/sections/CurrencyShowcase";
import Comparison from "@/components/landing/sections/Comparison";
import Features from "@/components/landing/sections/Features";
import HowItWorks from "@/components/landing/sections/HowItWorks";
import DashboardPreview from "@/components/landing/sections/DashboardPreview";
import CtaBand from "@/components/landing/sections/CtaBand";
import Footer from "@/components/landing/sections/Footer";

export default function Home() {
  return (
    <>
      <CurrencyField />
      <Navbar />
      <main>
        <Hero />
        <RateTicker />
        <CurrencyShowcase />
        <Comparison />
        <Features />
        <HowItWorks />
        <DashboardPreview />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
