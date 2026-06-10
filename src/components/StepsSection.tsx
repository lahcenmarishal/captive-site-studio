import { Compass, Search, Rocket, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import SectionLabel from "./SectionLabel";

const steps = [
  {
    n: "01",
    week: "Sem. 1",
    icon: Compass,
    title: "Cadrage",
    desc: "On comprend votre marque, vos objectifs et votre audience.",
    items: ["Brief stratégique", "Analyse concurrentielle", "Architecture du site"],
  },
  {
    n: "02",
    week: "Sem. 2",
    icon: Search,
    title: "Design",
    desc: "Maquettes premium et prototype interactif validés avant code.",
    items: ["Direction artistique", "Maquettes responsive", "Prototype cliquable"],
  },
  {
    n: "03",
    week: "Sem. 3",
    icon: Rocket,
    title: "Développement",
    desc: "Code performant, SEO-friendly et 100% sur-mesure.",
    items: ["Intégration premium", "Optimisation vitesse", "SEO technique"],
  },
  {
    n: "04",
    week: "Sem. 4",
    icon: ShieldCheck,
    title: "Lancement",
    desc: "Tests, mise en ligne et accompagnement post-livraison.",
    items: ["QA & tests croisés", "Mise en ligne", "Suivi 30 jours"],
  },
];

const StepsSection = () => (
  <section className="py-24 md:py-32 px-4 relative overflow-hidden">
    <div className="absolute -left-32 top-10 w-72 h-72 rounded-full bg-primary/10 blur-[100px]" />

    <div className="max-w-6xl mx-auto relative z-10">
      <div className="max-w-3xl mb-16">
        <SectionLabel number="05" label="Notre processus" />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl mt-6 leading-[1.05] tracking-tight"
        >
          Une méthode <span className="text-gradient-brand">en 4 étapes</span> claires.
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {steps.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: i * 0.1 }}
            className="glass-card rounded-3xl p-6 hover:-translate-y-1 hover:border-primary/40 transition-all duration-500"
          >
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-background/60 border border-border text-xs font-heading font-semibold">
                Étape : {s.n}
              </span>
              <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center">
                <s.icon className="w-5 h-5 text-secondary" />
              </div>
            </div>
            <div className="mt-5 text-xs text-secondary font-medium">{s.week}</div>
            <h3 className="font-heading font-bold text-2xl mt-1">{s.title}</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{s.desc}</p>
            <div className="my-5 h-px bg-border" />
            <ul className="space-y-2">
              {s.items.map((item, j) => (
                <li key={j} className="flex items-center gap-2 text-sm">
                  <span className="font-heading text-muted-foreground/60 w-5">
                    {String(i * 3 + j + 1).padStart(2, "0")}
                  </span>
                  <span className="text-foreground/90">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default StepsSection;
