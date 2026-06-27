import Navbar from "@/components/landing/Navbar";
import CurrencyField from "@/components/landing/CurrencyField";
import Hero from "@/components/landing/Hero";
import RateTicker from "@/components/landing/RateTicker";
import Comparison from "@/components/landing/Comparison";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import DashboardPreview from "@/components/landing/DashboardPreview";
import CtaBand from "@/components/landing/CtaBand";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <CurrencyField />
      <Navbar />
      <main>
        <Hero />
        <RateTicker />
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
