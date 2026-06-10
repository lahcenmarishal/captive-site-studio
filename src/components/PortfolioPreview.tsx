import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import SectionLabel from "./SectionLabel";
import portrait from "@/assets/about-portrait.jpg";

const projects = [
  { tag: "Vibe Clothing Co.", title: "Boost des ventes saison capsule", img: portrait },
  { tag: "Atlas Resto", title: "Refonte digitale & réservations", img: portrait },
  { tag: "Nimbus SaaS", title: "Plateforme & onboarding", img: portrait },
];

const PortfolioPreview = () => (
  <section className="py-24 md:py-32 px-4 relative overflow-hidden">
    <div className="max-w-6xl mx-auto relative z-10 grid lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
      <div>
        <SectionLabel number="04" label="Portfolio" />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl mt-6 leading-[1.05] tracking-tight"
        >
          Des marques de tous{" "}
          <span className="text-gradient-brand">secteurs</span>.
        </motion.h2>
        <p className="text-muted-foreground mt-6 max-w-md leading-relaxed">
          Notre portfolio rassemble une diversité de projets — du <span className="font-semibold text-foreground">site vitrine premium</span> à la
          plateforme SaaS complexe, en passant par des e-commerces qui performent.
        </p>
        <Link
          to="/portfolio"
          className="mt-8 inline-flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold pl-2 pr-6 py-2.5 rounded-full text-sm hover:-translate-y-0.5 transition-all"
        >
          <span className="w-8 h-8 rounded-full bg-background/30 flex items-center justify-center">
            <ArrowRight className="w-4 h-4" />
          </span>
          Voir les projets
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {projects.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={`relative rounded-3xl overflow-hidden border border-border group ${
              i === 0 ? "row-span-2 h-[420px]" : "h-[200px]"
            }`}
          >
            <img
              src={p.img}
              alt={p.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-background/80 backdrop-blur border border-border text-xs font-semibold">
              {p.tag}
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <div className="font-heading font-bold">{p.title}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default PortfolioPreview;
