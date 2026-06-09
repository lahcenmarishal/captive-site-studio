import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, Globe, ShoppingCart, Code2, Layers, Search, Wrench, Palette, Smartphone } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

const services = [
  {
    icon: Globe,
    title: "Sites vitrines",
    desc: "Présence en ligne moderne, rapide et optimisée pour convertir vos visiteurs en clients.",
  },
  {
    icon: ShoppingCart,
    title: "E-commerce",
    desc: "Boutiques en ligne sécurisées avec gestion produits, commandes et paiements intégrés.",
  },
  {
    icon: Code2,
    title: "Applications web & SaaS",
    desc: "Plateformes sur-mesure : tableaux de bord, marketplaces, outils métiers et solutions SaaS.",
  },
  {
    icon: Palette,
    title: "Design UX / UI",
    desc: "Identités digitales premium et interfaces pensées pour offrir une expérience mémorable.",
  },
  {
    icon: Search,
    title: "SEO & Performance",
    desc: "Optimisation technique, contenus et vitesse pour gagner en visibilité sur Google.",
  },
  {
    icon: Smartphone,
    title: "Responsive & Mobile",
    desc: "Tous nos projets sont parfaitement adaptés mobile, tablette et desktop.",
  },
  {
    icon: Layers,
    title: "Back-office & CMS",
    desc: "Interfaces d'administration intuitives pour gérer votre contenu en toute autonomie.",
  },
  {
    icon: Wrench,
    title: "Maintenance & Support",
    desc: "Mises à jour, monitoring, sauvegardes et accompagnement continu après livraison.",
  },
];

const Services = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-32 pb-20 px-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-0" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[120px] -z-0" />

      <div className="max-w-6xl mx-auto relative z-10">
        <AnimatedSection className="text-center mb-16 max-w-3xl mx-auto">
          <span className="badge-premium mb-6">Nos expertises</span>
          <h1 className="font-heading text-5xl md:text-6xl font-bold leading-tight">
            Tout ce dont vous avez besoin{" "}
            <span className="text-gradient-brand">pour briller</span> en ligne
          </h1>
          <p className="text-muted-foreground mt-6 text-lg">
            De la stratégie au déploiement, nous couvrons l'ensemble des services digitaux
            pour donner vie à votre projet.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <AnimatedSection key={s.title} delay={i * 0.06}>
              <div className="group relative glass-card rounded-3xl p-7 h-full overflow-hidden hover:-translate-y-1 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="feature-icon mb-5 group-hover:scale-110 transition-transform">
                    <s.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading text-xl font-bold">{s.title}</h3>
                  <p className="text-muted-foreground text-sm mt-3 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection className="mt-20 text-center" delay={0.2}>
          <div className="glass-card rounded-3xl p-10 md:p-14 max-w-3xl mx-auto relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-72 h-72 bg-primary/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-secondary/30 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="font-heading text-3xl md:text-4xl font-bold">
                Un projet en tête ?
              </h2>
              <p className="text-muted-foreground mt-4 max-w-md mx-auto">
                Discutons ensemble de votre vision. Nous vous proposons une démo personnalisée gratuite sous 24h.
              </p>
              <a
                href="/#demo-form"
                className="mt-8 inline-flex items-center gap-2 bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground font-semibold px-7 py-4 rounded-full shadow-[0_16px_50px_-12px_hsl(320_90%_50%/0.6)] hover:-translate-y-0.5 transition-all"
              >
                Démarrer mon projet <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </main>
    <Footer />
  </div>
);

export default Services;
