import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowDown, ArrowUp, Eye, EyeOff, ImageIcon, Loader2, Pencil, Plus, Save, ShoppingBag,
  Trash2, Upload, X, Mail, Phone, MessageSquare,
} from "lucide-react";

type Item = {
  id: string;
  title: string;
  category: string;
  price: number;
  description: string;
  features: string[];
  image_url: string | null;
  demo_url: string | null;
  published: boolean;
  display_order: number;
};

type Request = {
  id: string;
  item_id: string | null;
  item_title: string;
  nom: string;
  email: string;
  telephone: string;
  message: string | null;
  status: string;
  created_at: string;
};

const CATEGORIES = ["Site vitrine", "Site vitrine professionnel", "Site e-commerce", "Application web", "Plateforme SaaS", "Marketplace", "Blog"];

const empty: Partial<Item> = {
  title: "",
  category: "Site vitrine",
  price: 0,
  description: "",
  features: [],
  image_url: "",
  demo_url: "",
  published: false,
};

const AdminCatalogue = () => {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"items" | "requests">("items");
  const [editing, setEditing] = useState<Partial<Item> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["admin-catalogue-items"],
    queryFn: async () => {
      const { data, error } = await supabase.from("catalogue_items").select("*").order("display_order");
      if (error) throw error;
      return data as Item[];
    },
  });

  const { data: requests = [] } = useQuery({
    queryKey: ["admin-catalogue-requests"],
    queryFn: async () => {
      const { data, error } = await supabase.from("catalogue_requests").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Request[];
    },
  });

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `catalogue/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("portfolio-images").upload(fileName, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("portfolio-images").getPublicUrl(fileName);
      setEditing((p) => (p ? { ...p, image_url: urlData.publicUrl } : p));
      toast.success("Image uploadée");
    } catch {
      toast.error("Erreur upload");
    } finally {
      setUploading(false);
    }
  };

  const save = useMutation({
    mutationFn: async (p: Partial<Item>) => {
      const payload = {
        title: p.title!,
        category: p.category!,
        price: Number(p.price) || 0,
        description: p.description || "",
        features: p.features || [],
        image_url: p.image_url || null,
        demo_url: p.demo_url || null,
        published: p.published ?? false,
        display_order: p.display_order ?? items.length,
      };
      if (p.id) {
        const { error } = await supabase.from("catalogue_items").update(payload).eq("id", p.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("catalogue_items").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Sauvegardé");
      qc.invalidateQueries({ queryKey: ["admin-catalogue-items"] });
      setEditing(null);
      setIsNew(false);
    },
    onError: () => toast.error("Erreur sauvegarde"),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("catalogue_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Supprimé"); qc.invalidateQueries({ queryKey: ["admin-catalogue-items"] }); },
  });

  const togglePub = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { error } = await supabase.from("catalogue_items").update({ published }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-catalogue-items"] }),
  });

  const reorder = useMutation({
    mutationFn: async ({ id, newOrder, swapId, swapOrder }: { id: string; newOrder: number; swapId: string; swapOrder: number }) => {
      const { error: e1 } = await supabase.from("catalogue_items").update({ display_order: newOrder }).eq("id", id);
      if (e1) throw e1;
      const { error: e2 } = await supabase.from("catalogue_items").update({ display_order: swapOrder }).eq("id", swapId);
      if (e2) throw e2;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-catalogue-items"] }),
  });

  const updateReqStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("catalogue_requests").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Statut mis à jour"); qc.invalidateQueries({ queryKey: ["admin-catalogue-requests"] }); },
  });

  const delReq = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("catalogue_requests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Demande supprimée"); qc.invalidateQueries({ queryKey: ["admin-catalogue-requests"] }); },
  });

  const inputClass = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex items-center gap-1 mb-6 bg-muted rounded-xl p-1 w-fit">
        {[
          { id: "items" as const, label: "Sites en vente", icon: ShoppingBag, count: items.length },
          { id: "requests" as const, label: "Demandes", icon: Mail, count: requests.length },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all ${tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
            <span className="text-[10px] bg-muted-foreground/10 px-1.5 py-0.5 rounded-full">{t.count}</span>
          </button>
        ))}
      </div>

      {tab === "items" && (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-xl font-bold">Catalogue de sites</h2>
            <button
              onClick={() => { setEditing({ ...empty, display_order: items.length }); setIsNew(true); }}
              className="flex items-center gap-2 text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" /> Ajouter un site
            </button>
          </div>

          {itemsLoading ? (
            <div className="text-center py-12 text-muted-foreground">Chargement...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucun site dans le catalogue</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((p, idx) => (
                <div key={p.id} className="flex items-center gap-4 bg-card rounded-xl border border-border p-4 hover:shadow-sm transition-shadow">
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button onClick={() => { if (idx === 0) return; const prev = items[idx - 1]; reorder.mutate({ id: p.id, newOrder: prev.display_order, swapId: prev.id, swapOrder: p.display_order }); }} disabled={idx === 0} className="p-1 rounded text-muted-foreground hover:bg-muted disabled:opacity-20">
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => { if (idx === items.length - 1) return; const next = items[idx + 1]; reorder.mutate({ id: p.id, newOrder: next.display_order, swapId: next.id, swapOrder: p.display_order }); }} disabled={idx === items.length - 1} className="p-1 rounded text-muted-foreground hover:bg-muted disabled:opacity-20">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="w-16 h-12 rounded-lg bg-muted overflow-hidden shrink-0">
                    {p.image_url ? <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-5 h-5 text-muted-foreground/30" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm truncate">{p.title}</h4>
                      <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground shrink-0">{p.category}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{Number(p.price).toLocaleString("fr-FR")} €</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => togglePub.mutate({ id: p.id, published: !p.published })} className={`p-2 rounded-lg ${p.published ? "text-green-600 hover:bg-green-50" : "text-muted-foreground hover:bg-muted"}`}>
                      {p.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button onClick={() => { setEditing(p); setIsNew(false); }} className="p-2 rounded-lg text-muted-foreground hover:bg-muted">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => { if (confirm("Supprimer ce site ?")) del.mutate(p.id); }} className="p-2 rounded-lg text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "requests" && (
        <>
          <h2 className="font-heading text-xl font-bold mb-6">Demandes reçues</h2>
          {requests.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucune demande</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((r) => (
                <div key={r.id} className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{r.nom}</h4>
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{r.item_title}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <a href={`mailto:${r.email}`} className="flex items-center gap-1 hover:text-foreground"><Mail className="w-3 h-3" />{r.email}</a>
                        <a href={`tel:${r.telephone}`} className="flex items-center gap-1 hover:text-foreground"><Phone className="w-3 h-3" />{r.telephone}</a>
                        <span>{new Date(r.created_at).toLocaleString("fr-FR")}</span>
                      </div>
                      {r.message && (
                        <div className="mt-2 text-sm text-muted-foreground flex items-start gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <p className="whitespace-pre-wrap">{r.message}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <select value={r.status} onChange={(e) => updateReqStatus.mutate({ id: r.id, status: e.target.value })} className="text-xs border border-border rounded-md px-2 py-1 bg-background">
                        <option value="nouveau">Nouveau</option>
                        <option value="en_cours">En cours</option>
                        <option value="vendu">Vendu</option>
                        <option value="rejete">Rejeté</option>
                      </select>
                      <button onClick={() => { if (confirm("Supprimer cette demande ?")) delReq.mutate(r.id); }} className="p-2 rounded-lg text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-bold text-lg">{isNew ? "Nouveau site" : "Modifier le site"}</h3>
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Titre *</label>
                <input className={inputClass} value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Site Restaurant Premium" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Catégorie *</label>
                  <select className={inputClass} value={editing.category || ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Prix (€) *</label>
                  <input type="number" min="0" className={inputClass} value={editing.price ?? 0} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea className={inputClass + " min-h-[80px] resize-y"} value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Description du site..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fonctionnalités</label>
                <input className={inputClass} value={(editing.features || []).join(", ")} onChange={(e) => setEditing({ ...editing, features: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} placeholder="Réservation, Menu, Galerie..." />
                <p className="text-xs text-muted-foreground mt-1">Séparez par des virgules</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL démo</label>
                <input className={inputClass} value={editing.demo_url || ""} onChange={(e) => setEditing({ ...editing, demo_url: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image</label>
                {editing.image_url && (
                  <div className="mb-2 rounded-lg overflow-hidden border border-border">
                    <img src={editing.image_url} alt="Aperçu" className="w-full h-40 object-cover" />
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="flex items-center gap-2 text-sm font-medium bg-muted px-4 py-2 rounded-lg hover:bg-muted/80 disabled:opacity-50">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? "Upload..." : "Uploader une image"}
                </button>
                <input className={inputClass + " mt-2"} value={editing.image_url || ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} placeholder="Ou URL https://..." />
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={editing.published ?? false} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} className="rounded" />
                Publier ce site
              </label>
              <button onClick={() => editing.title && save.mutate(editing)} disabled={!editing.title || save.isPending} className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50">
                {save.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCatalogue;
