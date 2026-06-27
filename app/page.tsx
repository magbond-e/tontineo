import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import TrustBand from "@/components/landing/TrustBand";
import Features from "@/components/landing/Features";
import Simulator from "@/components/landing/Simulator";
import Philosophy from "@/components/landing/Philosophy";
import Protocol from "@/components/landing/Protocol";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <TrustBand />
        <Features />
        <Simulator />
        <Philosophy />
        <Protocol />
        <Testimonials />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
