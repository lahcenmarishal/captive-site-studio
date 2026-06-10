import { ArrowRight, Sparkles, Star } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";
import BrandMarquee from "./BrandMarquee";


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
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-24 pb-20 px-4">
      {/* Background image */}
      <div
        className="absolute inset-0 opacity-40"
        style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
      />
      {/* Dark overlay + gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />

      {/* Animated glow orbs */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 -left-20 w-[500px] h-[500px] rounded-full bg-primary/30 blur-[120px]"
      />
      <motion.div
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] rounded-full bg-secondary/30 blur-[120px]"
      />

      {/* Grain / grid */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, hsl(0 0% 100%) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 badge-premium mb-8"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span>Studio digital premium · Maroc</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-heading font-bold text-5xl md:text-7xl lg:text-8xl leading-[1.05] tracking-tight"
        >
          Des sites web qui{" "}
          <span className="text-gradient-brand">propulsent</span>{" "}
          votre marque
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-muted-foreground text-base md:text-xl mt-8 max-w-2xl mx-auto leading-relaxed"
        >
          Nous concevons des expériences web premium pour entreprises ambitieuses :
          stratégie, design et développement réunis pour livrer en quelques jours.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={scrollToForm}
            className="group inline-flex items-center gap-2 bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground font-semibold px-7 py-4 rounded-full text-base shadow-[0_16px_50px_-12px_hsl(320_90%_50%/0.6)] hover:-translate-y-1 transition-all duration-300"
          >
            Recevoir ma démo
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <a
            href="/catalogue"
            className="inline-flex items-center gap-2 bg-card/60 backdrop-blur-md border border-border text-foreground font-semibold px-7 py-4 rounded-full text-base hover:bg-card transition-all duration-300"
          >
            Voir le catalogue
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-14 flex items-center justify-center gap-6 flex-wrap text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-accent text-accent" />
            ))}
            <span className="ml-2 font-medium text-foreground">4.9/5</span>
            <span>· 50+ clients satisfaits</span>
          </div>
          <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-muted-foreground/40" />
          <span>Livraison en 3–5 jours</span>
          <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-muted-foreground/40" />
          <span>Réponse garantie sous 24h</span>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
