import { Zap, Award, Gift } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Rapide",
    desc: "Démo livrée en 3-5 jours, réponse en 24h",
  },
  {
    icon: Award,
    title: "Premium",
    desc: "Design et fonctionnalités de qualité professionnelle",
  },
  {
    icon: Gift,
    title: "Gratuit",
    desc: "Consultation sans engagement",
  },
];

const FeaturesSection = () => (
  <section className="py-20 px-4 section-gradient">
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      {features.map((f) => (
        <div key={f.title} className="flex flex-col items-center text-center">
          <div className="feature-icon mb-4">
            <f.icon className="w-7 h-7" />
          </div>
          <h3 className="font-heading font-bold text-lg">{f.title}</h3>
          <p className="text-muted-foreground text-sm mt-1 max-w-[220px]">{f.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

export default FeaturesSection;
