import { ArrowRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import teamImg from "@/assets/cta-team.jpg";

const CtaBanner = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToForm = () => {
    if (location.pathname !== "/") {
      navigate("/#demo-form");
      return;
    }
    document.getElementById("demo-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative px-4 py-16 md:py-24">
      <div className="max-w-6xl mx-auto relative rounded-[2.5rem] overflow-hidden border border-border/60">
        <img
          src={teamImg}
          alt="Équipe créative au travail"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />

        <div className="relative z-10 p-8 md:p-16 lg:p-20 min-h-[420px] flex flex-col justify-between gap-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-heading font-bold text-primary-foreground text-xl">
            P
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="font-heading font-bold text-4xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight max-w-3xl">
              Un projet ?{" "}
              <span className="text-gradient-brand">On est prêt</span>{" "}
              à vous aider.
            </h2>
            <button
              onClick={scrollToForm}
              className="mt-8 group inline-flex items-center gap-2 bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground font-semibold px-7 py-4 rounded-full text-base shadow-[0_16px_50px_-12px_hsl(320_90%_50%/0.6)] hover:-translate-y-1 transition-all duration-300"
            >
              Démarrer mon projet
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CtaBanner;
