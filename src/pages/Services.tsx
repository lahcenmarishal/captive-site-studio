import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, ArrowRight, Globe, ShoppingCart, Code2, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";
import DecorativeBlobs from "@/components/DecorativeBlobs";

const services = [
  {
    icon: Globe,
    title: "Site Vitrine Simple",
    subtitle: "Pour indépendants et petites entreprises",
    price: "490 €",
    delay: "3 à 5 jours",
    projectType: "Site vitrine",
    features: [
      "Design professionnel",
      "Site responsive (mobile / tablette / ordinateur)",
      "3 à 5 pages",
      "Formulaire de contact",
      "SEO de base",
      "Google Maps",
      "Mise en ligne du site",
    ],
  },
  {
    icon: Layers,
    title: "Site Vitrine Professionnel",
    subtitle: "Pour entreprises qui veulent gérer leur site",
    price: "890 €",
    delay: "5 à 10 jours",
    projectType: "Site vitrine professionnel",
    features: [
      "Design personnalisé",
      "Site responsive optimisé conversion",
      "5 à 10 pages",
      "Espace d'administration (back-office)",
      "Gestion des pages et contenus",
      "Gestion des images et médias",
      "Blog ou actualités",
      "SEO optimisé",
      "Formulaires avancés",
      "Sécurité et performance",
    ],
  },
  {
    icon: ShoppingCart,
    title: "Site E-commerce",
    subtitle: "Pour vendre des produits en ligne",
    price: "1 490 €",
    delay: "10 à 20 jours",
    projectType: "Site e-commerce",
    features: [
      "Design e-commerce professionnel",
      "Catalogue produits",
      "Gestion des commandes",
      "Paiement sécurisé (Stripe / PayPal)",
      "Gestion des stocks",
      "Dashboard administrateur",
      "Pages produits optimisées",
      "SEO e-commerce",
      "Configuration livraison",
      "Panier & paiement sécurisé",
      "Gestion clients & promotions",
    ],
  },
  {
    icon: Code2,
    title: "Application Web / Plateforme",
    subtitle: "Pour startups et projets SaaS",
    price: "3 900 €",
    delay: "3 à 6 semaines",
    projectType: "Application web / SaaS",
    features: [
      "Architecture application web",
      "Design UX/UI professionnel",
      "Tableaux de bord (Admin, Utilisateurs, Partenaires)",
      "Authentification utilisateurs",
      "Gestion abonnements",
      "Paiement en ligne",
      "Analytics & Notifications",
      "API intégrée",
      "Technologies : React, Node.js, Supabase, Stripe",
    ],
    examples: ["SaaS", "Marketplace", "Plateforme éducative", "Plateforme de réservation", "Logiciel web"],
  },
];

const Services = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-24 pb-16 px-4 relative overflow-hidden">
      <DecorativeBlobs variant="services" />

      <div className="max-w-6xl mx-auto relative z-10">
        <AnimatedSection className="text-center mb-16">
          <h1 className="font-heading text-4xl md:text-5xl font-bold">
            Nos <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Services</span>
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-lg">
            Des solutions web adaptées à chaque besoin et chaque budget
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((s, i) => (
            <AnimatedSection key={s.title} delay={i * 0.1}>
              <div
                className="group relative bg-card/80 backdrop-blur-sm rounded-3xl border border-border p-8 flex flex-col transition-all duration-300 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-1 overflow-hidden h-full"
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-secondary/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />

                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-primary/15 transition-all duration-300">
                    <s.icon className="w-7 h-7 text-primary" />
                  </div>

                  <h3 className="font-heading text-xl font-bold">{s.title}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{s.subtitle}</p>

                  <div className="mt-6 mb-6">
                    <span className="font-heading text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">À partir de {s.price}</span>
                    <span className="text-muted-foreground text-sm ml-2">· {s.delay}</span>
                  </div>

                  {s.examples && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {s.examples.map((ex) => (
                        <span key={ex} className="text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground">{ex}</span>
                      ))}
                    </div>
                  )}

                  <ul className="space-y-2.5 flex-1">
                    {s.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={`/#demo-form?type=${encodeURIComponent(s.projectType)}`}
                    className="mt-8 w-full flex items-center justify-center gap-2 font-semibold text-primary-foreground px-6 py-3.5 rounded-xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-[0_8px_24px_-4px_hsl(210_85%_45%/0.35)] hover:-translate-y-0.5"
                  >
                    Demander une démo gratuite <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Services;
