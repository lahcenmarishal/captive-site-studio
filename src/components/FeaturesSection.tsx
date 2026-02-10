import { Zap, Award, Gift, Clock, Headphones, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Ultra Rapide",
    desc: "Votre démo livrée en 3-5 jours ouvrables. Réponse garantie en 24h.",
    highlight: "3-5 jours",
  },
  {
    icon: Award,
    title: "Qualité Premium",
    desc: "Design moderne, responsive et optimisé pour convertir vos visiteurs.",
    highlight: "100% pro",
  },
  {
    icon: Gift,
    title: "Démo Gratuite",
    desc: "Visualisez votre futur site avant de vous engager. Zéro risque.",
    highlight: "0 MAD",
  },
  {
    icon: Clock,
    title: "Suivi en Temps Réel",
    desc: "Restez informé à chaque étape de l'avancement de votre projet.",
    highlight: "Transparent",
  },
  {
    icon: Headphones,
    title: "Support Dédié",
    desc: "Un interlocuteur unique pour répondre à toutes vos questions.",
    highlight: "24/7",
  },
  {
    icon: ShieldCheck,
    title: "Satisfaction Garantie",
    desc: "Modifications illimitées jusqu'à votre validation finale.",
    highlight: "Garanti",
  },
];

const FeaturesSection = () => (
  <section className="py-24 px-4 bg-muted/30">
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-14">
        <h2 className="font-heading text-3xl md:text-4xl font-bold">
          Pourquoi nous choisir ?
        </h2>
        <p className="text-muted-foreground mt-3 max-w-lg mx-auto text-lg">
          Tout ce qu'il faut pour lancer votre présence en ligne
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => (
          <div
            key={f.title}
            className="group bg-card rounded-2xl border border-border p-7 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-bold text-base">{f.title}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                    {f.highlight}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
