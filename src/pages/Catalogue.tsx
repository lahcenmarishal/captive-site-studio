import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AnimatedSection from "@/components/AnimatedSection";
import DecorativeBlobs from "@/components/DecorativeBlobs";
import {
  ArrowRight, Check, ExternalLink, Loader2, Send, ShoppingBag, X,
  ShoppingCart, UtensilsCrossed, Home, HeartPulse, GraduationCap, Plane,
  Hammer, User, Newspaper, LayoutDashboard, Store, Globe, Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface CatalogueItem {
  id: string;
  title: string;
  category: string;
  price: number;
  description: string;
  features: string[];
  image_url: string | null;
  demo_url: string | null;
}

const CATEGORY_META: Record<string, { icon: React.ComponentType<{ className?: string }>; fields: string[] }> = {
  "E-commerce": { icon: ShoppingCart, fields: ["Nombre de produits estimé", "Moyens de paiement souhaités"] },
  "Restaurant": { icon: UtensilsCrossed, fields: ["Nom du restaurant", "Réservation en ligne ? (oui/non)"] },
  "Immobilier": { icon: Home, fields: ["Type de biens (vente/location)", "Nombre d'annonces estimé"] },
  "Santé & Bien-être": { icon: HeartPulse, fields: ["Spécialité / activité", "Prise de rendez-vous en ligne ?"] },
  "Éducation": { icon: GraduationCap, fields: ["Type d'organisme (école, formateur...)", "Inscription en ligne ?"] },
  "Tourisme & Hôtellerie": { icon: Plane, fields: ["Type d'hébergement / activité", "Réservation en ligne ?"] },
  "Artisanat & Services locaux": { icon: Hammer, fields: ["Métier / service proposé", "Zone d'intervention"] },
  "Portfolio & Personnel": { icon: User, fields: ["Profession", "Nombre de projets à présenter"] },
  "Blog & Magazine": { icon: Newspaper, fields: ["Thématique principale", "Fréquence de publication"] },
  "Application web / SaaS": { icon: LayoutDashboard, fields: ["Fonctionnalité principale", "Authentification utilisateurs ?"] },
  "Marketplace": { icon: Store, fields: ["Type de produits / services", "Nombre de vendeurs estimé"] },
  "Site vitrine": { icon: Globe, fields: ["Activité de l'entreprise", "Nombre de pages souhaité"] },
  "Autre": { icon: Sparkles, fields: ["Décrivez votre projet"] },
};

const getMeta = (cat: string) => CATEGORY_META[cat] ?? CATEGORY_META["Autre"];

const Catalogue = () => {
  const [selected, setSelected] = useState<CatalogueItem | null>(null);
  const [activeCat, setActiveCat] = useState<string>("Toutes");
  const [form, setForm] = useState<{ nom: string; email: string; telephone: string; message: string; extras: Record<string, string> }>({
    nom: "", email: "", telephone: "", message: "", extras: {},
  });
  const [sending, setSending] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["catalogue-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("catalogue_items")
        .select("*")
        .eq("published", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as CatalogueItem[];
    },
  });

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => set.add(i.category || "Autre"));
    return ["Toutes", ...Array.from(set)];
  }, [items]);

  const grouped = useMemo(() => {
    const map = new Map<string, CatalogueItem[]>();
    items.forEach((i) => {
      const key = i.category || "Autre";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(i);
    });
    return map;
  }, [items]);

  const visibleCategories = activeCat === "Toutes" ? Array.from(grouped.keys()) : [activeCat];

  const openRequest = (item: CatalogueItem) => {
    setSelected(item);
    const meta = getMeta(item.category);
    const extras: Record<string, string> = {};
    meta.fields.forEach((f) => (extras[f] = ""));
    setForm({ nom: "", email: "", telephone: "", message: "", extras });
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSending(true);
    try {
      const meta = getMeta(selected.category);
      const extrasText = meta.fields
        .map((f) => `${f} : ${form.extras[f] || "—"}`)
        .join("\n");
      const fullMessage = `[Catégorie : ${selected.category}]\n${extrasText}${form.message ? `\n\nMessage :\n${form.message}` : ""}`;
      const { error } = await supabase.from("catalogue_requests").insert({
        item_id: selected.id,
        item_title: `${selected.title} (${selected.category})`,
        nom: form.nom,
        email: form.email,
        telephone: form.telephone,
        message: fullMessage,
      });
      if (error) throw error;
      toast.success("Demande envoyée ! Nous vous contacterons sous 24h.");
      setSelected(null);
    } catch {
      toast.error("Une erreur est survenue. Réessayez.");
    } finally {
      setSending(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all";

  const selectedMeta = selected ? getMeta(selected.category) : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 px-4 relative overflow-hidden">
        <DecorativeBlobs variant="section" />
        <div className="max-w-6xl mx-auto relative z-10">
          <AnimatedSection className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-4">
              <ShoppingBag className="w-4 h-4" />
              Sites prêts à l'emploi
            </span>
            <h1 className="font-heading text-4xl md:text-5xl font-bold">
              Notre <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Catalogue</span>
            </h1>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-lg">
              Découvrez nos sites web préconçus, classés par secteur d'activité
            </p>
          </AnimatedSection>

          {/* Category filter */}
          {!isLoading && items.length > 0 && (
            <AnimatedSection className="mb-10">
              <div className="flex flex-wrap justify-center gap-2">
                {categories.map((cat) => {
                  const Icon = cat === "Toutes" ? ShoppingBag : getMeta(cat).icon;
                  const active = activeCat === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCat(cat)}
                      className={`inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full border transition-all ${
                        active
                          ? "bg-primary text-primary-foreground border-primary shadow-[var(--shadow-elevated)]"
                          : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/40"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" /> {cat}
                    </button>
                  );
                })}
              </div>
            </AnimatedSection>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-2xl border border-border h-96 animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <AnimatedSection className="text-center py-20">
              <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">Notre catalogue sera bientôt disponible.</p>
            </AnimatedSection>
          ) : (
            <div className="space-y-16">
              {visibleCategories.map((cat) => {
                const list = grouped.get(cat) ?? [];
                if (list.length === 0) return null;
                const Icon = getMeta(cat).icon;
                return (
                  <section key={cat}>
                    <AnimatedSection className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-heading text-2xl font-bold">{cat}</h2>
                        <p className="text-xs text-muted-foreground">{list.length} site{list.length > 1 ? "s" : ""} disponible{list.length > 1 ? "s" : ""}</p>
                      </div>
                    </AnimatedSection>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {list.map((item, i) => (
                        <AnimatedSection key={item.id} delay={i * 0.06}>
                          <div className="group relative bg-card/80 backdrop-blur-sm rounded-2xl border border-border overflow-hidden hover:shadow-[var(--shadow-elevated)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                            <div className="aspect-video bg-muted overflow-hidden">
                              {item.image_url ? (
                                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                  <Icon className="w-12 h-12" />
                                </div>
                              )}
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-secondary bg-secondary/10 px-2.5 py-1 rounded-full self-start">
                                <Icon className="w-3 h-3" /> {item.category}
                              </span>
                              <h3 className="font-heading font-bold text-lg mt-3">{item.title}</h3>
                              {item.description && (
                                <p className="text-muted-foreground text-sm mt-2 line-clamp-2 whitespace-pre-wrap">{item.description}</p>
                              )}
                              {item.features?.length > 0 && (
                                <ul className="mt-3 space-y-1">
                                  {item.features.slice(0, 4).map((f) => (
                                    <li key={f} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                      <Check className="w-3 h-3 text-secondary mt-0.5 shrink-0" /> {f}
                                    </li>
                                  ))}
                                </ul>
                              )}
                              <div className="mt-auto pt-5 flex items-center justify-between">
                                <div>
                                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">À partir de</p>
                                  <p className="font-heading text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                    {Number(item.price).toLocaleString("fr-FR")} €
                                  </p>
                                </div>
                                {item.demo_url && (
                                  <a href={item.demo_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                                    Démo <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                              <button
                                onClick={() => openRequest(item)}
                                className="mt-4 w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-primary-foreground px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-[var(--shadow-elevated)] hover:-translate-y-0.5 transition-all"
                              >
                                Je veux ce site <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </AnimatedSection>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Request modal — adapted to category */}
      {selected && selectedMeta && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                  <selectedMeta.icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg">Demander ce site</h3>
                  <p className="text-sm text-muted-foreground">{selected.title}</p>
                  <span className="inline-block mt-1 text-[10px] font-medium text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">{selected.category}</span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Nom *</label>
                <input required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} placeholder="Votre nom" className={inputClass} maxLength={100} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email *</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="votre@email.com" className={inputClass} maxLength={255} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Téléphone *</label>
                <input required value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} placeholder="+33 6 XX XX XX XX" className={inputClass} maxLength={20} />
              </div>

              {/* Category-specific fields */}
              {selectedMeta.fields.length > 0 && (
                <div className="space-y-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider">Informations spécifiques · {selected.category}</p>
                  {selectedMeta.fields.map((f) => (
                    <div key={f}>
                      <label className="block text-sm font-medium mb-1.5">{f}</label>
                      <input
                        value={form.extras[f] || ""}
                        onChange={(e) => setForm({ ...form, extras: { ...form.extras, [f]: e.target.value } })}
                        className={inputClass}
                        maxLength={200}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1.5">Message <span className="text-muted-foreground font-normal">(optionnel)</span></label>
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Personnalisations souhaitées..." className={inputClass + " min-h-[80px] resize-y"} maxLength={1000} />
              </div>
              <button type="submit" disabled={sending} className="w-full flex items-center justify-center gap-2 text-base font-semibold text-primary-foreground px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-[var(--shadow-elevated)] hover:-translate-y-0.5 transition-all disabled:opacity-60">
                {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi...</> : <>Envoyer ma demande <Send className="w-4 h-4" /></>}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Catalogue;
