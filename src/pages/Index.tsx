
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { CTA } from "@/components/CTA";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Notice } from "@/components/Notice";
import { HeroSlider } from "@/components/HeroSlider";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Notice />
      <HeroSlider />
      <Hero />
      <Features />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
