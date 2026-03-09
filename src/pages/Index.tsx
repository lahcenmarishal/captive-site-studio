import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import DemoForm from "@/components/DemoForm";
import StepsSection from "@/components/StepsSection";
import FeaturesSection from "@/components/FeaturesSection";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    const isDemoFormHash =
      location.hash === "#demo-form" || location.hash.startsWith("#demo-form?");

    if (!isDemoFormHash) return;

    // Wait a tick to ensure the form is mounted, then scroll precisely to it.
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
      <DemoForm />
      <StepsSection />
      <FeaturesSection />
      <Footer />
    </div>
  );
};

export default Index;
