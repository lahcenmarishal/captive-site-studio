import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    title: "Site Vitrine Simple",
    subtitle: "Pour indépendants et petites entreprises",
    price: "490 €",
    delay: "3 à 5 jours",
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
    title: "Site Vitrine Professionnel",
    subtitle: "Pour entreprises qui veulent gérer leur site",
    price: "890 €",
    delay: "5 à 10 jours",
    popular: true,
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
    title: "Site E-commerce",
    subtitle: "Pour vendre des produits en ligne",
    price: "1 490 €",
    delay: "10 à 20 jours",
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
    title: "Application Web / Plateforme",
    subtitle: "Pour startups et projets SaaS",
    price: "3 900 €",
    delay: "3 à 6 semaines",
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
    <main className="pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="font-heading text-4xl md:text-5xl font-bold">
            Nos <span className="text-primary">Services</span>
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-lg">
            Des solutions web adaptées à chaque besoin et chaque budget
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((s) => (
            <div
              key={s.title}
              className={`relative bg-card rounded-3xl border p-8 flex flex-col transition-all duration-300 hover:shadow-[var(--shadow-elevated)] hover:-translate-y-1 ${
                s.popular ? "border-primary shadow-[var(--shadow-elevated)]" : "border-border"
              }`}
            >
              {s.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 badge-premium text-xs !py-1 !px-4">
                  Populaire
                </span>
              )}
              <h3 className="font-heading text-xl font-bold">{s.title}</h3>
              <p className="text-muted-foreground text-sm mt-1">{s.subtitle}</p>

              <div className="mt-6 mb-6">
                <span className="font-heading text-3xl font-bold text-primary">À partir de {s.price}</span>
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

              <Link
                to="/contact"
                className="mt-8 w-full flex items-center justify-center gap-2 font-semibold text-primary-foreground px-6 py-3.5 rounded-xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-[0_8px_24px_-4px_hsl(210_85%_45%/0.35)] hover:-translate-y-0.5"
              >
                Demander une démo gratuite <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Services;
