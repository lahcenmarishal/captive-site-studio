import { ClipboardList, Zap, Monitor, ShieldCheck, Truck, ArrowRight } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const steps = [
  { icon: ClipboardList, title: "Remplissez", subtitle: "le formulaire en 2 min", emoji: "📋" },
  { icon: Zap, title: "On vous contacte", subtitle: "sous 24h max", emoji: "⚡" },
  { icon: Monitor, title: "Démo créée", subtitle: "100% personnalisée", emoji: "🎨" },
  { icon: ShieldCheck, title: "Validation", subtitle: "et acompte 30%", emoji: "✅" },
  { icon: Truck, title: "Livraison", subtitle: "site prêt à l'emploi", emoji: "🚀" },
];

const StepsSection = () => (
  <section className="py-24 px-4 bg-muted/30 relative overflow-hidden">
    {/* Decorative line */}
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

    <div className="max-w-5xl mx-auto">
      <AnimatedSection className="text-center mb-16">
        <h2 className="font-heading text-3xl md:text-4xl font-bold">
          Comment ça <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">marche</span> ?
        </h2>
        <p className="text-muted-foreground mt-3 max-w-lg mx-auto text-lg">
          De l'idée à la mise en ligne, un processus simple et rapide
        </p>
      </AnimatedSection>

      {/* Desktop: horizontal timeline */}
      <div className="hidden md:flex items-start justify-between gap-2">
        {steps.map((step, i) => (
          <AnimatedSection key={step.title} delay={i * 0.1} className="flex items-start flex-1">
            <div className="flex flex-col items-center text-center flex-1">
              <div className="relative group">
                <div className="w-20 h-20 rounded-3xl bg-card border-2 border-border flex items-center justify-center text-4xl shadow-[var(--shadow-card)] group-hover:shadow-[var(--shadow-elevated)] group-hover:-translate-y-2 group-hover:border-primary/30 transition-all duration-300 cursor-default">
                  {step.emoji}
                </div>
                <div className="absolute -top-1.5 -left-1.5 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-lg">
                  {i + 1}
                </div>
              </div>
              <h3 className="font-heading font-bold text-base mt-4">{step.title}</h3>
              <p className="text-muted-foreground text-sm mt-1 max-w-[140px]">{step.subtitle}</p>
            </div>
            {i < steps.length - 1 && (
              <div className="flex items-center pt-9 px-1 text-muted-foreground/30">
                <div className="w-8 h-0.5 bg-gradient-to-r from-border to-primary/20" />
                <ArrowRight className="w-4 h-4 -ml-1" />
              </div>
            )}
          </AnimatedSection>
        ))}
      </div>

      {/* Mobile: vertical cards */}
      <div className="md:hidden space-y-4">
        {steps.map((step, i) => (
          <AnimatedSection key={step.title} delay={i * 0.08}>
            <div className="flex items-center gap-4 bg-card rounded-2xl border border-border p-5 shadow-[var(--shadow-card)]">
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
          </AnimatedSection>
        ))}
      </div>
    </div>
  </section>
);

export default StepsSection;
