import { ArrowRight, Sparkles } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const scrollToForm = () => {
    document.getElementById("demo-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="relative min-h-[600px] flex items-center justify-center text-center px-4 py-24"
      style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0 hero-section opacity-80" />
      <div className="relative z-10 max-w-3xl mx-auto">
        <span className="badge-premium mb-6 animate-fade-up">
          <Sparkles className="w-4 h-4" />
          Démo gratuite pour projets éligibles
        </span>

        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mt-6 leading-tight animate-fade-up" style={{ animationDelay: "0.1s" }}>
          Votre Site Web{" "}
          <span className="text-secondary">Professionnel</span> en 3‑5 Jours
        </h1>
        <p className="text-secondary/90 text-base md:text-lg font-medium mt-3 animate-fade-up" style={{ animationDelay: "0.15s" }}>
          Pour entreprises et projets sérieux en phase de lancement
        </p>

        <p className="text-primary-foreground/70 text-lg md:text-xl mt-4 max-w-xl mx-auto animate-fade-up" style={{ animationDelay: "0.2s" }}>
          Obtenez une démo gratuite après validation de votre projet.
          <br />
          Consultation réservée aux professionnels, réponse garantie sous 24 heures.
        </p>

        <button onClick={scrollToForm} className="cta-button mt-10 inline-flex items-center gap-2 text-lg animate-fade-up" style={{ animationDelay: "0.3s" }}>
          Demander une évaluation de projet <ArrowRight className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-16 max-w-lg mx-auto animate-fade-up" style={{ animationDelay: "0.4s" }}>
          {[
            { value: "24h", label: "Réponse Rapide" },
            { value: "50+", label: "Projets livrés" },
            { value: "Pro", label: "Projets éligibles" },
          ].map((stat) => (
            <div key={stat.label} className="stat-card bg-primary-foreground/10 border-primary-foreground/10 backdrop-blur-sm !px-3 !py-4 sm:!px-8 sm:!py-6">
              <div className="text-secondary font-heading font-bold text-lg sm:text-xl">{stat.value}</div>
              <div className="text-primary-foreground/60 text-xs sm:text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
