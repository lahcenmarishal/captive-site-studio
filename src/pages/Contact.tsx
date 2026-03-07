import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import { Send, Lock, Loader2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({ nom: "", email: "", telephone: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("send-demo-request", {
        body: {
          nom: formData.nom,
          email: formData.email,
          telephone: formData.telephone,
          activite: "Contact direct",
          entreprise: "N/A",
          message: formData.message,
        },
      });
      if (error) throw error;
      toast.success("Message envoyé ! Nous vous répondrons sous 24h.");
      setFormData({ nom: "", email: "", telephone: "", message: "" });
    } catch {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-border bg-background px-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="font-heading text-4xl md:text-5xl font-bold">
              Nous <span className="text-primary">Contacter</span>
            </h1>
            <p className="text-muted-foreground mt-4 text-lg">
              Une question ou un projet ? Contactez-nous, réponse garantie sous 24h.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-10 justify-center">
            <a href="mailto:contact@prodevelo.com" className="inline-flex items-center gap-2 bg-card border border-border rounded-xl px-5 py-3 text-sm hover:shadow-[var(--shadow-card)] transition-all">
              <Mail className="w-4 h-4 text-primary" /> contact@prodevelo.com
            </a>
          </div>

          <div className="bg-card rounded-3xl border border-border p-8 md:p-10 shadow-[0_20px_60px_-15px_hsl(210_40%_12%/0.1)]">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">Nom *</label>
                <input name="nom" required placeholder="Votre nom" className={inputClass} value={formData.nom} onChange={handleChange} maxLength={100} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Email *</label>
                  <input name="email" type="email" required placeholder="votre@email.com" className={inputClass} value={formData.email} onChange={handleChange} maxLength={255} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Téléphone</label>
                  <input name="telephone" placeholder="+33 6 XX XX XX XX" className={inputClass} value={formData.telephone} onChange={handleChange} maxLength={20} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Message *</label>
                <textarea name="message" required placeholder="Décrivez votre projet ou posez votre question..." className={inputClass + " min-h-[120px] resize-y"} value={formData.message} onChange={handleChange} maxLength={2000} />
              </div>
              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 text-lg font-semibold text-primary-foreground px-8 py-4 rounded-xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-[0_8px_24px_-4px_hsl(210_85%_45%/0.35)] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Envoi en cours...</> : <>Envoyer le message <Send className="w-5 h-5" /></>}
              </button>
              <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Lock className="w-4 h-4" /> Vos informations sont confidentielles et sécurisées.
              </p>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
