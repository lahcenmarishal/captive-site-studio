import { useState } from "react";
import { ChevronDown } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const faqItems = [
  {
    question: "Quels moyens de paiement acceptez-vous ?",
    answer:
      "Nous acceptons le paiement par Payoneer ainsi que par virement bancaire simple. Choisissez la méthode qui vous convient le mieux.",
  },
  {
    question: "Les transactions sont-elles sécurisées ?",
    answer:
      "Oui, toutes nos transactions sont entièrement sécurisées. Nous utilisons des protocoles de sécurité fiables pour garantir la protection de vos données et de vos paiements.",
  },
  {
    question: "Combien de temps prend la création d'un site ?",
    answer:
      "Le délai varie selon la complexité du projet. Un site vitrine est généralement livré en 3 à 5 jours, tandis qu'un projet plus complexe peut prendre 2 à 4 semaines.",
  },
  {
    question: "Comment se déroule la démo ?",
    answer:
      "Nous créons une maquette fonctionnelle personnalisée de votre futur site afin que vous puissiez visualiser le rendu avant de vous engager pleinement.",
  },
  {
    question: "Proposez-vous un accompagnement après la livraison ?",
    answer:
      "Oui, nous proposons un support technique après la livraison pour vous accompagner dans la prise en main de votre site et répondre à vos questions.",
  },
  {
    question: "Mon site sera-t-il optimisé pour le référencement (SEO) ?",
    answer:
      "Oui, tous nos sites sont optimisés pour le SEO : balises meta, structure HTML sémantique, vitesse de chargement et compatibilité mobile sont inclus dans chaque projet.",
  },
  {
    question: "Puis-je modifier le contenu de mon site moi-même ?",
    answer:
      "Bien sûr. Selon le type de site choisi, nous intégrons un panneau d'administration ou un CMS pour que vous puissiez mettre à jour vos contenus en toute autonomie.",
  },
  {
    question: "Quels types de sites pouvez-vous créer ?",
    answer:
      "Nous réalisons des sites vitrines, des sites e-commerce, des applications web, des plateformes SaaS et des blogs. Chaque projet est développé sur mesure selon vos besoins.",
  },
];

const FaqItem = ({ question, answer, index }: { question: string; answer: string; index: number }) => {
  const [open, setOpen] = useState(false);
  return (
    <AnimatedSection delay={index * 0.05}>
      <div className="border-b border-border last:border-0">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between py-4 text-left text-sm font-medium text-foreground hover:text-primary transition-colors"
        >
          {question}
          <ChevronDown
            className={`w-4 h-4 shrink-0 ml-3 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>
        <div
          className={`overflow-hidden transition-all duration-300 ${open ? "max-h-40 pb-4" : "max-h-0"}`}
        >
          <p className="text-sm text-muted-foreground leading-relaxed">{answer}</p>
        </div>
      </div>
    </AnimatedSection>
  );
};

const FaqSection = () => (
  <section className="py-24 px-4 relative">
    <div className="max-w-3xl mx-auto">
      <AnimatedSection className="text-center mb-10">
        <h2 className="font-heading text-3xl md:text-4xl font-bold">
          Questions{" "}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            fréquentes
          </span>
        </h2>
        <p className="text-muted-foreground mt-3 max-w-lg mx-auto text-lg">
          Tout ce que vous devez savoir avant de démarrer
        </p>
      </AnimatedSection>

      <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border px-6 md:px-8">
        {faqItems.map((item, i) => (
          <FaqItem key={i} question={item.question} answer={item.answer} index={i} />
        ))}
      </div>
    </div>
  </section>
);

export default FaqSection;
