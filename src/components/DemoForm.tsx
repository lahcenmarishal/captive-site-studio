import { useState, useEffect } from "react";
import { Send, Lock, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AnimatedSection from "./AnimatedSection";
import DecorativeBlobs from "./DecorativeBlobs";
import { useLocation } from "react-router-dom";

const projectTypes = [
  "Site vitrine",
  "Site vitrine professionnel",
  "Site e-commerce",
  "Application web / SaaS",
  "Autre projet",
];

const DemoForm = () => {
  const [formData, setFormData] = useState({
    nom: "",
    telephone: "",
    email: "",
    entreprise: "",
    activite: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("send-demo-request", {
        body: {
          nom: formData.nom,
          telephone: formData.telephone,
          email: formData.email,
          activite: formData.activite,
          entreprise: formData.entreprise,
          message: formData.message,
        },
      });
      if (error) throw error;
      toast.success("Merci ! Nous vous contacterons sous 24h avec votre démo personnalisée.");
      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "Lead", {
          content_category: formData.activite,
          currency: "EUR",
          value: 0,
        });
      }
      setFormData({ nom: "", telephone: "", email: "", entreprise: "", activite: "", message: "" });
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
      <DecorativeBlobs variant="section" />

      <div className="max-w-2xl mx-auto relative z-10">
        <AnimatedSection className="text-center mb-10">
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
            Complétez le formulaire pour recevoir votre démo gratuite
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.15}>
          <div className="bg-card/80 backdrop-blur-sm rounded-3xl border border-border p-8 md:p-10 shadow-[0_20px_60px_-15px_hsl(210_40%_12%/0.1)]">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">Nom et prénom *</label>
                <input name="nom" required placeholder="Jean Dupont" className={inputClass} value={formData.nom} onChange={handleChange} maxLength={100} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Email *</label>
                  <input name="email" type="email" required placeholder="votre@email.com" className={inputClass} value={formData.email} onChange={handleChange} maxLength={255} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Téléphone *</label>
                  <input name="telephone" required placeholder="+33 6 XX XX XX XX" className={inputClass} value={formData.telephone} onChange={handleChange} maxLength={20} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Entreprise ou activité *</label>
                <input name="entreprise" required placeholder="Nom de votre entreprise" className={inputClass} value={formData.entreprise} onChange={handleChange} maxLength={100} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Type de projet *</label>
                <select name="activite" required className={selectClass} value={formData.activite} onChange={handleChange}>
                  <option value="">-- Sélectionnez un type de projet --</option>
                  {projectTypes.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Description du projet</label>
                <textarea name="message" placeholder="Décrivez brièvement votre projet..." className={inputClass + " min-h-[100px] resize-y"} value={formData.message} onChange={handleChange} maxLength={1000} />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group w-full flex items-center justify-center gap-2 text-lg font-semibold text-primary-foreground px-8 py-4 rounded-xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-[0_8px_24px_-4px_hsl(210_85%_45%/0.35)] hover:shadow-[0_12px_32px_-4px_hsl(210_85%_45%/0.45)] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Envoi en cours...</> : <>Recevoir ma démo gratuite <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
              </button>

              <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground text-center">
                <Lock className="w-4 h-4" />
                Réponse sous 24h – Démo gratuite sans engagement.
              </p>
            </form>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default DemoForm;
