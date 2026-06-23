import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Comparison from "@/components/landing/Comparison";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import DashboardPreview from "@/components/landing/DashboardPreview";
import CtaBand from "@/components/landing/CtaBand";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
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
