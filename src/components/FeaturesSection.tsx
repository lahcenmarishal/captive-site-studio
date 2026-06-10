import { FileCheck2, Sparkles, Users, MessageCircle, Wallet, Headset } from "lucide-react";
import { motion } from "framer-motion";
import SectionLabel from "./SectionLabel";

const features = [
  {
    icon: FileCheck2,
    title: "Approche orientée résultats",
    desc: "On construit pour convertir, pas seulement pour faire joli. Chaque décision sert vos KPIs.",
  },
  {
    icon: Sparkles,
    title: "Sur-mesure premium",
    desc: "Un design pensé pour votre marque. Aucun template, aucune solution générique.",
  },
  {
    icon: Users,
    title: "Expérience utilisateur",
    desc: "Interfaces intuitives, rapides et accessibles sur tous les écrans.",
  },
  {
    icon: MessageCircle,
    title: "Communication transparente",
    desc: "Un interlocuteur unique, des points réguliers, vous restez maître du projet.",
  },
  {
    icon: Wallet,
    title: "Investissement maîtrisé",
    desc: "Devis clairs, paliers de paiement et zéro frais cachés. Vous savez où va chaque dirham.",
  },
  {
    icon: Headset,
    title: "Support après livraison",
    desc: "On reste à vos côtés : maintenance, évolutions et formation à votre équipe.",
  },
];

const FeaturesSection = () => (
  <section className="py-24 md:py-32 px-4 relative overflow-hidden">
    <div className="absolute right-0 top-1/2 w-96 h-96 rounded-full bg-secondary/10 blur-[120px]" />

    <div className="max-w-6xl mx-auto relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <SectionLabel number="03" label="Pourquoi nous choisir" align="center" />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl mt-6 leading-[1.05] tracking-tight"
        >
          On combine stratégie créative et exécution rigoureuse.
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="group relative glass-card rounded-3xl p-7 overflow-hidden hover:border-primary/40 transition-all duration-500"
          >
            {/* Big faded number */}
            <span className="absolute -top-2 right-5 font-heading font-bold text-7xl text-muted-foreground/10 group-hover:text-primary/20 transition-colors duration-500 select-none">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center mb-5">
                <f.icon className="w-5 h-5 text-secondary" />
              </div>
              <h3 className="font-heading font-bold text-xl mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
