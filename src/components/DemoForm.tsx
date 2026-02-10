import { useState } from "react";
import { Send, Lock } from "lucide-react";

const activites = [
  "Restaurant / Café",
  "E-commerce / Boutique",
  "Immobilier",
  "Santé / Bien-être",
  "Éducation / Formation",
  "Technologie / IT",
  "Artisanat / Fait-main",
  "Services juridiques",
  "Tourisme / Hôtellerie",
  "Autre",
];

const budgets = [
  "3 000 - 5 000 MAD",
  "5 000 - 10 000 MAD",
  "10 000 - 20 000 MAD",
  "20 000+ MAD",
];

const timelines = [
  "Dès que possible",
  "Dans 1-2 semaines",
  "Dans 1 mois",
  "Je ne suis pas sûr",
];

const services = [
  "Site vitrine",
  "E-commerce",
  "Landing page",
  "Application web",
  "Refonte de site existant",
];

const DemoForm = () => {
  const [formData, setFormData] = useState({
    nom: "",
    telephone: "",
    email: "",
    entreprise: "",
    activite: "",
    budget: "",
    timeline: "",
    service: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Track Facebook Pixel Lead event
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "Lead", {
        content_name: formData.service,
        content_category: formData.activite,
      });
    }
    alert("Merci ! Nous vous contacterons sous 24h avec votre démo personnalisée.");
  };

  const selectClass =
    "w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none";
  const inputClass =
    "w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <section id="demo-form" className="py-20 px-4 section-gradient">
      <div className="max-w-2xl mx-auto">
        <div className="form-card">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-center">
            Recevoir Votre Démo Personnalisée
          </h2>
          <p className="text-muted-foreground text-center mt-2 mb-8">
            Complétez le formulaire pour une qualification précise de votre projet
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Votre Nom *</label>
              <input
                name="nom"
                required
                placeholder="Jean Dupont"
                className={inputClass}
                value={formData.nom}
                onChange={handleChange}
                maxLength={100}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">Téléphone *</label>
                <input
                  name="telephone"
                  required
                  placeholder="+212 6XX XXX XXX"
                  className={inputClass}
                  value={formData.telephone}
                  onChange={handleChange}
                  maxLength={20}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email (optionnel)</label>
                <input
                  name="email"
                  type="email"
                  placeholder="votre@email.com"
                  className={inputClass}
                  value={formData.email}
                  onChange={handleChange}
                  maxLength={255}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Nom de votre entreprise / marque *</label>
              <input
                name="entreprise"
                required
                placeholder="Exemple : Café Atlas, Boutique XYZ..."
                className={inputClass}
                value={formData.entreprise}
                onChange={handleChange}
                maxLength={150}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Nature de l'activité *</label>
              <select name="activite" required className={selectClass} value={formData.activite} onChange={handleChange}>
                <option value="">-- Sélectionnez une activité --</option>
                {activites.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">Budget envisagé *</label>
                <select name="budget" required className={selectClass} value={formData.budget} onChange={handleChange}>
                  <option value="">-- Sélectionnez une option --</option>
                  {budgets.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Quand souhaitez-vous lancer le site ? *</label>
                <select name="timeline" required className={selectClass} value={formData.timeline} onChange={handleChange}>
                  <option value="">-- Sélectionnez une option --</option>
                  {timelines.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Type de service *</label>
              <select name="service" required className={selectClass} value={formData.service} onChange={handleChange}>
                <option value="">-- Sélectionnez un service --</option>
                {services.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="bg-muted rounded-xl px-5 py-3 text-sm text-muted-foreground">
              <strong>À savoir :</strong> Nos projets de création de sites web démarrent à partir de{" "}
              <span className="font-bold text-foreground">3 000 MAD</span>, selon les besoins.
            </div>

            <button type="submit" className="cta-button w-full flex items-center justify-center gap-2 text-lg">
              Voir ma démo personnalisée <Send className="w-5 h-5" />
            </button>

            <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Lock className="w-4 h-4" />
              Vos informations sont confidentielles et sécurisées. Aucun spam, promis.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default DemoForm;
