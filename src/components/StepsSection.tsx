import { ClipboardList, Zap, Monitor, ShieldCheck, Truck, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "Remplissez",
    subtitle: "le formulaire en 2 min",
    emoji: "📋",
  },
  {
    icon: Zap,
    title: "On vous contacte",
    subtitle: "sous 24h max",
    emoji: "⚡",
  },
  {
    icon: Monitor,
    title: "Démo créée",
    subtitle: "100% personnalisée",
    emoji: "🎨",
  },
  {
    icon: ShieldCheck,
    title: "Validation",
    subtitle: "et acompte 30%",
    emoji: "✅",
  },
  {
    icon: Truck,
    title: "Livraison",
    subtitle: "site prêt à l'emploi",
    emoji: "🚀",
  },
];

const StepsSection = () => (
  <section className="py-24 px-4">
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="font-heading text-3xl md:text-4xl font-bold">
          Comment ça marche ?
        </h2>
        <p className="text-muted-foreground mt-3 max-w-lg mx-auto text-lg">
          De l'idée à la mise en ligne, un processus simple et rapide
        </p>
      </div>

      {/* Desktop: horizontal timeline */}
      <div className="hidden md:flex items-start justify-between gap-2">
        {steps.map((step, i) => (
          <div key={step.title} className="flex items-start flex-1">
            <div className="flex flex-col items-center text-center flex-1">
              {/* Big emoji + number */}
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-card border-2 border-border flex items-center justify-center text-4xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] hover:-translate-y-1 transition-all duration-300 cursor-default">
                  {step.emoji}
                </div>
                <div className="absolute -top-1.5 -left-1.5 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </div>
              </div>
              <h3 className="font-heading font-bold text-base mt-4">{step.title}</h3>
              <p className="text-muted-foreground text-sm mt-1 max-w-[140px]">{step.subtitle}</p>
            </div>

            {/* Arrow connector (except last) */}
            {i < steps.length - 1 && (
              <div className="flex items-center pt-9 px-1 text-muted-foreground/30">
                <div className="w-8 h-0.5 bg-border" />
                <ArrowRight className="w-4 h-4 -ml-1" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile: vertical cards */}
      <div className="md:hidden space-y-4">
        {steps.map((step, i) => (
          <div
            key={step.title}
            className="flex items-center gap-4 bg-card rounded-2xl border border-border p-5 shadow-[var(--shadow-card)]"
          >
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-2xl">
                {step.emoji}
              </div>
              <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
                {i + 1}
              </div>
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm">{step.title}</h3>
              <p className="text-muted-foreground text-xs mt-0.5">{step.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default StepsSection;
