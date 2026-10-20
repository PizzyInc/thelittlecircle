import Navbar from "@/components/marketing/Navbar";
import Hero from "@/components/marketing/Hero";
import HowItWorks from "@/components/marketing/HowItWorks";
import DragToScan from "@/components/marketing/DragToScan";
import WhatItDetects from "@/components/marketing/WhatItDetects";
import Privacy from "@/components/marketing/Privacy";
import Pricing from "@/components/marketing/Pricing";
import Footer from "@/components/marketing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <HowItWorks />
      <DragToScan />
      <WhatItDetects />
      <Privacy />
      <Pricing />
      <Footer />
    </main>
  );
}
