import { motion } from "framer-motion";
import { ArrowRight, Globe, ShoppingBag, Search, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import SectionLabel from "./SectionLabel";
import portrait from "@/assets/about-portrait.jpg";

const services = [
  {
    n: "1",
    icon: Globe,
    title: "Sites vitrines premium",
    desc: "Des sites qui inspirent confiance et convertissent vos visiteurs en clients.",
    items: ["Direction artistique unique", "Animations sur-mesure", "Optimisation mobile"],
  },
  {
    n: "2",
    icon: ShoppingBag,
    title: "E-commerce sur-mesure",
    desc: "Boutiques en ligne pensées pour vendre, du panier au paiement sécurisé.",
    items: ["Catalogue dynamique", "Paiement intégré", "Tableau de bord vendeur"],
  },
  {
    n: "3",
    icon: Smartphone,
    title: "Applications web & SaaS",
    desc: "Plateformes web complètes, performantes et évolutives.",
    items: ["Authentification sécurisée", "Backend Cloud", "API & intégrations"],
  },
  {
    n: "4",
    icon: Search,
    title: "SEO & performance",
    desc: "On rend votre site rapide, visible sur Google et indexé correctement.",
    items: ["Audit technique", "Optimisation Core Web Vitals", "Stratégie de contenu"],
  },
];

const ServicesPreview = () => (
  <section className="py-24 md:py-32 px-4 relative overflow-hidden">
    <div className="absolute -right-32 top-20 w-72 h-72 rounded-full bg-secondary/10 blur-[100px]" />

    <div className="max-w-6xl mx-auto relative z-10">
      <div className="max-w-3xl mb-16">
        <SectionLabel number="02" label="Services" />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl mt-6 leading-[1.05] tracking-tight"
        >
          Une suite complète de{" "}
          <span className="text-gradient-brand">services digitaux</span>.
        </motion.h2>
      </div>

      <div className="space-y-5">
        {services.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: i * 0.08 }}
            className="glass-card rounded-3xl p-6 md:p-8 grid md:grid-cols-[1.2fr_1fr] gap-6 md:gap-10 items-center hover:border-primary/40 transition-all duration-500 group"
          >
            <div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center">
                  <s.icon className="w-5 h-5 text-secondary" />
                </div>
                <h3 className="font-heading font-bold text-2xl md:text-3xl">
                  {s.n}. {s.title}
                  <span className="text-secondary">*</span>
                </h3>
              </div>
              <p className="text-muted-foreground mt-4 leading-relaxed max-w-lg">
                {s.desc}
              </p>
              <ul className="mt-5 space-y-2">
                {s.items.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-medium">
                    <span className="w-5 h-5 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/services"
                className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold pl-2 pr-5 py-2 rounded-full text-sm hover:-translate-y-0.5 transition-all"
              >
                <span className="w-7 h-7 rounded-full bg-background/30 flex items-center justify-center">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
                En savoir plus
              </Link>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-border h-48 md:h-56 hidden md:block">
              <img
                src={portrait}
                alt={s.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-background/40 to-transparent" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesPreview;
