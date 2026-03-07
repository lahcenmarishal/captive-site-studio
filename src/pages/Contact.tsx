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
            <a href="mailto:contact.prodevelo@gmail.com" className="inline-flex items-center gap-2 bg-card border border-border rounded-xl px-5 py-3 text-sm hover:shadow-[var(--shadow-card)] transition-all">
              <Mail className="w-4 h-4 text-primary" /> contact.prodevelo@gmail.com
            </a>
            <a href="https://wa.me/212671588356" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[hsl(142_70%_45%)] text-white rounded-xl px-5 py-3 text-sm font-medium hover:bg-[hsl(142_70%_40%)] transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
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
