import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { resolveTechnologies } from "@/lib/portfolioTech";
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical, X, Save, Loader2, ImageIcon, Upload, ArrowUp, ArrowDown } from "lucide-react";

type Project = {
  id: string;
  name: string;
  type: string;
  site_title: string;
  description: string;
  image_url: string | null;
  published: boolean;
  display_order: number;
  created_at: string;
  technologies: string[];
};

const emptyProject = { name: "", type: "Site vitrine", site_title: "", description: "", image_url: "", published: false, technologies: resolveTechnologies("Site vitrine", null) };

const AdminPortfolio = () => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Partial<Project> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["admin-portfolio"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolio_projects")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as Project[];
    },
  });

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from("portfolio-images")
        .upload(fileName, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage
        .from("portfolio-images")
        .getPublicUrl(fileName);
      setEditing((prev) => prev ? { ...prev, image_url: urlData.publicUrl } : prev);
      toast.success("Image uploadée");
    } catch {
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (project: Partial<Project>) => {
      const payload = {
        name: project.name!,
        type: project.type!,
        site_title: project.site_title || project.name!,
        description: project.description || "",
        image_url: project.image_url || null,
        published: project.published ?? false,
        display_order: project.display_order ?? projects.length,
        technologies: project.technologies || [],
      };
      if (project.id) {
        const { error } = await supabase.from("portfolio_projects").update(payload).eq("id", project.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("portfolio_projects").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Projet sauvegardé");
      queryClient.invalidateQueries({ queryKey: ["admin-portfolio"] });
      setEditing(null);
      setIsNew(false);
    },
    onError: () => toast.error("Erreur lors de la sauvegarde"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("portfolio_projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Projet supprimé");
      queryClient.invalidateQueries({ queryKey: ["admin-portfolio"] });
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { error } = await supabase.from("portfolio_projects").update({ published }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-portfolio"] });
      toast.success("Statut mis à jour");
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ id, newOrder, swapId, swapOrder }: { id: string; newOrder: number; swapId: string; swapOrder: number }) => {
      const { error: e1 } = await supabase.from("portfolio_projects").update({ display_order: newOrder }).eq("id", id);
      if (e1) throw e1;
      const { error: e2 } = await supabase.from("portfolio_projects").update({ display_order: swapOrder }).eq("id", swapId);
      if (e2) throw e2;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-portfolio"] });
    },
  });

  const inputClass = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-xl font-bold">Portfolio</h2>
          <button
            onClick={() => {
              const type = "Site vitrine";
              setEditing({ ...emptyProject, type, technologies: resolveTechnologies(type, null), display_order: projects.length });
              setIsNew(true);
            }}
          className="flex items-center gap-2 text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Ajouter un projet
        </button>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-bold text-lg">{isNew ? "Nouveau projet" : "Modifier le projet"}</h3>
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom du projet *</label>
                <input className={inputClass} value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Mon Super Projet" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Titre du site *</label>
                <input className={inputClass} value={editing.site_title || ""} onChange={(e) => setEditing({ ...editing, site_title: e.target.value })} placeholder="Titre affiché sur la page portfolio" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type de site *</label>
                <select
                  className={inputClass}
                  value={editing.type || ""}
                  onChange={(e) => {
                    const type = e.target.value;
                    setEditing({ ...editing, type, technologies: resolveTechnologies(type, null) });
                  }}
                >
                  {[
                    "Site vitrine",
                    "Site vitrine personnalisé",
                    "Site vitrine professionnel",
                    "Site e-commerce",
                    "Application web",
                    "Plateforme SaaS",
                    "Marketplace",
                    "Blog",
                  ].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea className={inputClass + " min-h-[80px] resize-y"} value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Description détaillée du projet..." />
                <p className="text-xs text-muted-foreground mt-1">Utilisez Entrée pour créer des retours à la ligne</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Technologies utilisées</label>
                <input 
                  className={inputClass} 
                  value={(editing.technologies || []).join(", ")} 
                  onChange={(e) => setEditing({ ...editing, technologies: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })} 
                  placeholder="React, TypeScript, Tailwind CSS, Supabase..." 
                />
                <p className="text-xs text-muted-foreground mt-1">Séparez les technologies par des virgules</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image du projet</label>
                {editing.image_url && (
                  <div className="mb-2 rounded-lg overflow-hidden border border-border">
                    <img src={editing.image_url} alt="Aperçu" className="w-full h-40 object-cover" />
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 text-sm font-medium bg-muted px-4 py-2 rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? "Upload en cours..." : "Uploader une image"}
                </button>
                <p className="text-xs text-muted-foreground mt-1">Ou entrez une URL :</p>
                <input className={inputClass + " mt-1"} value={editing.image_url || ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} placeholder="https://..." />
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={editing.published ?? false} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} className="rounded" />
                Publier ce projet
              </label>
              <button
                onClick={() => editing.name && saveMutation.mutate(editing)}
                disabled={!editing.name || saveMutation.isPending}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Projects list */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Chargement...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Aucun projet dans le portfolio</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((p, index) => (
            <div key={p.id} className="flex items-center gap-4 bg-card rounded-xl border border-border p-4 hover:shadow-sm transition-shadow">
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  onClick={() => {
                    if (index === 0) return;
                    const prev = projects[index - 1];
                    reorderMutation.mutate({ id: p.id, newOrder: prev.display_order, swapId: prev.id, swapOrder: p.display_order });
                  }}
                  disabled={index === 0 || reorderMutation.isPending}
                  className="p-1 rounded text-muted-foreground hover:bg-muted transition-colors disabled:opacity-20"
                  title="Monter"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (index === projects.length - 1) return;
                    const next = projects[index + 1];
                    reorderMutation.mutate({ id: p.id, newOrder: next.display_order, swapId: next.id, swapOrder: p.display_order });
                  }}
                  disabled={index === projects.length - 1 || reorderMutation.isPending}
                  className="p-1 rounded text-muted-foreground hover:bg-muted transition-colors disabled:opacity-20"
                  title="Descendre"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="w-16 h-12 rounded-lg bg-muted overflow-hidden shrink-0">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-5 h-5 text-muted-foreground/30" /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm truncate">{p.name}</h4>
                  <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground shrink-0">{p.type}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{p.site_title}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => togglePublish.mutate({ id: p.id, published: !p.published })}
                  className={`p-2 rounded-lg transition-colors ${p.published ? "text-green-600 hover:bg-green-50" : "text-muted-foreground hover:bg-muted"}`}
                  title={p.published ? "Dépublier" : "Publier"}
                >
                  {p.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => { setEditing(p); setIsNew(false); }} className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { if (confirm("Supprimer ce projet ?")) deleteMutation.mutate(p.id); }}
                  className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPortfolio;
