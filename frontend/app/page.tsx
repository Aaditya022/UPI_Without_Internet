import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PixelDivider from "@/components/PixelDivider";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import DemoDashboard from "@/components/DemoDashboard";
import Stats from "@/components/Stats";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="flex flex-col w-full bg-[#050505] pt-[60px]">
      <Navbar />
      <Hero />
      <PixelDivider />
      <Features />
      <HowItWorks />
      <DemoDashboard />
      <Stats />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
