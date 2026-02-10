import { ClipboardList, Zap, Monitor, ShieldCheck, Truck } from "lucide-react";

const steps = [
  { icon: ClipboardList, title: "Remplissez", subtitle: "le formulaire" },
  { icon: Zap, title: "Nous contactons", subtitle: "sous 24h" },
  { icon: Monitor, title: "Démo créée", subtitle: "Personnalisée" },
  { icon: ShieldCheck, title: "Validez", subtitle: "et payez 30%" },
  { icon: Truck, title: "Livraison", subtitle: "Finalisation" },
];

const StepsSection = () => (
  <section className="py-20 px-4">
    <h2 className="font-heading text-2xl md:text-3xl font-bold text-center mb-14">
      Comment ça marche
    </h2>
    <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">
      {steps.map((step, i) => (
        <div key={step.title} className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="step-circle text-lg">{i + 1}</div>
          </div>
          <step.icon className="w-6 h-6 text-primary mb-2" />
          <div className="font-semibold text-sm">{step.title}</div>
          <div className="text-muted-foreground text-xs">{step.subtitle}</div>
        </div>
      ))}
    </div>
  </section>
);

export default StepsSection;
