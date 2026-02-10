import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import DemoForm from "@/components/DemoForm";
import StepsSection from "@/components/StepsSection";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";

const Index = () => {
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
