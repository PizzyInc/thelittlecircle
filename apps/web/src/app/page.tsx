import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import WhatItDetects from "@/components/WhatItDetects";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <Hero />
      <HowItWorks />
      <WhatItDetects />
      <Pricing />
      <Footer />
    </main>
  );
}
