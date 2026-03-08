import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";
import DecorativeBlobs from "./DecorativeBlobs";

const HeroSection = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToForm = () => {
    if (location.pathname !== "/") {
      navigate("/#demo-form");
      return;
    }
    document.getElementById("demo-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="relative min-h-[600px] flex items-center justify-center text-center px-4 py-24 overflow-hidden"
      style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0 hero-section opacity-90" />
      <DecorativeBlobs variant="hero" />

      {/* Decorative grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, hsl(0 0% 100%) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="badge-premium mb-6"
        >
          <Sparkles className="w-4 h-4" />
          Démo gratuite sans engagement
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mt-6 leading-tight"
        >
          Votre Site Web{" "}
          <span className="text-secondary relative">
            Professionnel
            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
              <path d="M2 6c40-4 80-4 196 0" stroke="hsl(var(--secondary))" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
            </svg>
          </span>{" "}
          en 3‑5 Jours
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-secondary/90 text-base md:text-lg font-medium mt-3"
        >
          Création de sites web modernes pour entreprises et entrepreneurs.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="text-primary-foreground/70 text-lg md:text-xl mt-4 max-w-xl mx-auto"
        >
          Recevez une démo gratuite personnalisée.
          <br />
          Réponse garantie sous 24 heures.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={scrollToForm}
          className="cta-button mt-10 inline-flex items-center gap-2 text-lg"
        >
          Recevoir ma démo gratuite <ArrowRight className="w-5 h-5" />
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-3 gap-3 sm:gap-4 mt-16 max-w-lg mx-auto"
        >
          {[
            { value: "24h", label: "Réponse Rapide" },
            { value: "50+", label: "Projets livrés" },
            { value: "100%", label: "Satisfaction" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="group bg-primary-foreground/5 backdrop-blur-md border border-primary-foreground/10 rounded-2xl !px-3 !py-4 sm:!px-8 sm:!py-6 text-center hover:bg-primary-foreground/10 transition-all duration-300"
            >
              <div className="text-secondary font-heading font-bold text-lg sm:text-xl group-hover:scale-110 transition-transform duration-300">{stat.value}</div>
              <div className="text-primary-foreground/60 text-xs sm:text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
