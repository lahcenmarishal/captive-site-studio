import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Code2, LogOut, RefreshCw, Eye, Clock, CheckCircle, XCircle, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

type DemoRequest = {
  id: string;
  nom: string;
  telephone: string;
  email: string | null;
  entreprise: string;
  activite: string;
  timeline: string;
  service: string;
  status: string;
  notes: string | null;
  created_at: string;
};

const statusColors: Record<string, string> = {
  nouveau: "bg-blue-100 text-blue-800",
  "en cours": "bg-yellow-100 text-yellow-800",
  terminé: "bg-green-100 text-green-800",
  rejeté: "bg-red-100 text-red-800",
};

const statusOptions = ["nouveau", "en cours", "terminé", "rejeté"];

const AdminDashboard = () => {
  const [requests, setRequests] = useState<DemoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DemoRequest | null>(null);
  const navigate = useNavigate();

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("demo_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erreur de chargement");
      console.error(error);
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Check auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/admin/login");
      else fetchRequests();
    });

    // Realtime
    const channel = supabase
      .channel("demo_requests_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "demo_requests" }, () => {
        fetchRequests();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("demo_requests")
      .update({ status })
      .eq("id", id);

    if (error) toast.error("Erreur de mise à jour");
    else {
      toast.success("Statut mis à jour");
      if (selected?.id === id) setSelected({ ...selected, status });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });

  const stats = {
    total: requests.length,
    nouveau: requests.filter((r) => r.status === "nouveau").length,
    enCours: requests.filter((r) => r.status === "en cours").length,
    termine: requests.filter((r) => r.status === "terminé").length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Code2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-lg">
              Pro<span className="text-secondary">develo</span>
              <span className="text-muted-foreground text-sm ml-2">Admin</span>
            </span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: stats.total, icon: Eye, color: "text-foreground" },
            { label: "Nouveau", value: stats.nouveau, icon: Clock, color: "text-blue-600" },
            { label: "En cours", value: stats.enCours, icon: RefreshCw, color: "text-yellow-600" },
            { label: "Terminé", value: stats.termine, icon: CheckCircle, color: "text-green-600" },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <s.icon className="w-4 h-4" /> {s.label}
              </div>
              <div className={`text-2xl font-heading font-bold ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl font-bold">Demandes de démo</h2>
          <button onClick={fetchRequests} className="flex items-center gap-2 text-sm text-primary hover:underline">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Actualiser
          </button>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nom</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Entreprise</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Service</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Contact</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(r.created_at)}</td>
                    <td className="px-4 py-3 font-medium">{r.nom}</td>
                    <td className="px-4 py-3">{r.entreprise}</td>
                    <td className="px-4 py-3">{r.service}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{r.telephone}</span>
                        {r.email && <span className="flex items-center gap-1 text-muted-foreground"><Mail className="w-3 h-3" />{r.email}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={r.status}
                        onChange={(e) => updateStatus(r.id, e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${statusColors[r.status] || "bg-muted"}`}
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelected(r)}
                        className="text-primary hover:underline text-xs font-medium"
                      >
                        Détails
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && requests.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      Aucune demande pour le moment
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <div className="bg-card rounded-2xl border border-border p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-lg font-bold">Détails de la demande</h3>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">✕</button>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  { label: "Nom", value: selected.nom },
                  { label: "Téléphone", value: selected.telephone },
                  { label: "Email", value: selected.email || "Non fourni" },
                  { label: "Entreprise", value: selected.entreprise },
                  { label: "Activité", value: selected.activite },
                  { label: "Service", value: selected.service },
                  { label: "Timeline", value: selected.timeline },
                  { label: "Date", value: formatDate(selected.created_at) },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between py-2 border-b border-border last:border-0">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-right">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">Statut</label>
                <select
                  value={selected.status}
                  onChange={(e) => updateStatus(selected.id, e.target.value)}
                  className={`text-sm font-medium px-3 py-2 rounded-lg border border-border w-full ${statusColors[selected.status] || ""}`}
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
