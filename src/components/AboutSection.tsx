import { motion } from "framer-motion";
import SectionLabel from "./SectionLabel";
import portrait from "@/assets/about-portrait.jpg";

const AboutSection = () => (
  <section className="py-24 md:py-32 px-4 relative overflow-hidden">
    {/* Glow orb */}
    <div className="absolute -left-40 top-1/3 w-96 h-96 rounded-full bg-primary/15 blur-[120px]" />

    <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
      {/* Portrait */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
        className="relative"
      >
        <div className="relative rounded-[2rem] overflow-hidden border border-border/60">
          <img
            src={portrait}
            alt="Fondateur Prodevelo"
            loading="lazy"
            className="w-full h-[500px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
          <div className="absolute top-5 right-5 w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-heading font-bold text-primary-foreground">
            P
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div>
        <SectionLabel number="01" label="À propos" />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl mt-6 leading-[1.05] tracking-tight"
        >
          Prodevelo, studio{" "}
          <span className="text-foreground">créatif</span>{" "}
          <span className="text-muted-foreground/30">de développement web premium.</span>
        </motion.h2>

        <div className="mt-8 glass-card rounded-3xl p-6 md:p-7">
          <p className="text-muted-foreground leading-relaxed">
            Nous aidons les marques ambitieuses à se démarquer en combinant stratégie,
            design d'exception et développement performant. Du concept au déploiement,
            nous livrons des expériences web qui convertissent.
          </p>
        </div>

        <div className="mt-5 glass-card rounded-3xl p-6 md:p-7 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-heading font-bold text-primary-foreground shrink-0">
            P
          </div>
          <div className="flex-1">
            <div className="font-heading font-bold">Équipe Prodevelo</div>
            <div className="text-xs text-muted-foreground">Studio digital · Maroc</div>
          </div>
          <div className="hidden sm:block flex-1 space-y-2">
            <Bar label="Design" value={97} />
            <Bar label="Développement" value={95} />
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Bar = ({ label, value }: { label: string; value: number }) => (
  <div>
    <div className="flex justify-between text-xs text-muted-foreground">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-1">
      <div
        className="h-full bg-gradient-to-r from-primary to-secondary"
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

export default AboutSection;
