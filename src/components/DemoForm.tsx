import { useState } from "react";
import { Send, Lock, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
    timeline: "",
    service: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-demo-request", {
        body: formData,
      });
      if (error) throw error;
      toast.success("Merci ! Nous vous contacterons sous 24h avec votre démo personnalisée.");
      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "Lead", {
          content_name: formData.service,
          content_category: formData.activite,
          currency: "MAD",
          value: 0,
        });
      }
      setFormData({ nom: "", telephone: "", email: "", entreprise: "", activite: "", timeline: "", service: "" });
    } catch (err: any) {
      console.error("Error:", err);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const selectClass =
    "w-full rounded-xl border border-border bg-background px-4 py-3.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary appearance-none transition-all duration-200";
  const inputClass =
    "w-full rounded-xl border border-border bg-background px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200";

  return (
    <section id="demo-form" className="py-24 px-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl translate-y-1/2" />

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            Gratuit & sans engagement
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold">
            Recevoir Votre Démo{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Personnalisée
            </span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto">
            Complétez le formulaire pour une qualification précise de votre projet
          </p>
        </div>

        {/* Form card */}
        <div className="bg-card rounded-3xl border border-border p-8 md:p-10 shadow-[0_20px_60px_-15px_hsl(210_40%_12%/0.1)]">
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

            <div>
              <label className="block text-sm font-medium mb-1.5">Type de service *</label>
              <select name="service" required className={selectClass} value={formData.service} onChange={handleChange}>
                <option value="">-- Sélectionnez un service --</option>
                {services.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Quand souhaitez-vous lancer ? *</label>
              <select name="timeline" required className={selectClass} value={formData.timeline} onChange={handleChange}>
                <option value="">-- Sélectionnez une option --</option>
                {timelines.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl px-5 py-4 text-sm text-muted-foreground border border-primary/10">
              <strong>À savoir :</strong> Nos projets de création de sites web démarrent à partir de{" "}
              <span className="font-bold text-foreground">1 500 MAD</span>, selon les besoins.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 text-lg font-semibold text-primary-foreground px-8 py-4 rounded-xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-[0_8px_24px_-4px_hsl(210_85%_45%/0.35)] hover:shadow-[0_12px_32px_-4px_hsl(210_85%_45%/0.45)] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Envoi en cours...</> : <>Voir ma démo personnalisée <Send className="w-5 h-5" /></>}
            </button>

            <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Lock className="w-4 h-4" />
              Vos informations sont confidentielles et sécurisées.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default DemoForm;
