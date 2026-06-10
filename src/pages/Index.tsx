import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesPreview from "@/components/ServicesPreview";
import FeaturesSection from "@/components/FeaturesSection";
import PortfolioPreview from "@/components/PortfolioPreview";
import StepsSection from "@/components/StepsSection";
import CtaBanner from "@/components/CtaBanner";
import DemoForm from "@/components/DemoForm";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    const isDemoFormHash =
      location.hash === "#demo-form" || location.hash.startsWith("#demo-form?");
    if (!isDemoFormHash) return;
    setTimeout(() => {
      document.getElementById("demo-form")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ServicesPreview />
      <FeaturesSection />
      <PortfolioPreview />
      <StepsSection />
      <CtaBanner />
      <DemoForm />
      <FaqSection />
      <Footer />
    </div>
  );
};

export default Index;
