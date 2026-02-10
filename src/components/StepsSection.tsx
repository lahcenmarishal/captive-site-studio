import { ClipboardList, Zap, Monitor, ShieldCheck, Truck } from "lucide-react";

const steps = [
  { icon: ClipboardList, title: "Remplissez", subtitle: "le formulaire", color: "from-blue-500 to-cyan-400" },
  { icon: Zap, title: "Nous contactons", subtitle: "sous 24h", color: "from-amber-400 to-orange-500" },
  { icon: Monitor, title: "Démo créée", subtitle: "Personnalisée", color: "from-emerald-400 to-teal-500" },
  { icon: ShieldCheck, title: "Validez", subtitle: "et payez 30%", color: "from-violet-500 to-purple-600" },
  { icon: Truck, title: "Livraison", subtitle: "Finalisation", color: "from-rose-400 to-pink-500" },
];

const StepsSection = () => (
  <section className="py-24 px-4 relative overflow-hidden">
    {/* Decorative background */}
    <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
    
    <div className="relative z-10">
      <div className="text-center mb-16">
        <span className="text-primary font-medium text-sm tracking-widest uppercase">Processus simple</span>
        <h2 className="font-heading text-3xl md:text-4xl font-bold mt-3">
          Comment ça marche
        </h2>
        <p className="text-muted-foreground mt-3 max-w-md mx-auto">
          Un processus clair et transparent en 5 étapes
        </p>
      </div>

      <div className="max-w-5xl mx-auto relative">
        {/* Connecting line */}
        <div className="hidden md:block absolute top-16 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 md:gap-6">
          {steps.map((step, i) => (
            <div key={step.title} className="flex flex-col items-center text-center group">
              {/* Number badge */}
              <div className="relative mb-5">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-card border-2 border-border flex items-center justify-center text-xs font-bold text-foreground shadow-sm">
                  {i + 1}
                </div>
              </div>

              <div className="font-heading font-semibold text-sm">{step.title}</div>
              <div className="text-muted-foreground text-xs mt-0.5">{step.subtitle}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default StepsSection;
