import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Code2, LogOut, RefreshCw, Eye, Clock, CheckCircle, XCircle, BarChart3, KeyRound, FolderOpen, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import PipelineBoard from "@/components/admin/PipelineBoard";
import AdminPortfolio from "@/components/admin/AdminPortfolio";
import AdminCatalogue from "@/components/admin/AdminCatalogue";

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
  demo_sent_date: string | null;
  payment_date: string | null;
  payment_amount: number | null;
  is_locked: boolean;
};

const AdminDashboard = () => {
  const [requests, setRequests] = useState<DemoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pipeline" | "portfolio">("pipeline");
  const navigate = useNavigate();

  const fetchRequests = async (showLoader = true) => {
    if (showLoader) setLoading(true);

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

    if (showLoader) setLoading(false);
  };

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let pollInterval: number | null = null;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchRequests(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/admin/login");
        return;
      }

      fetchRequests();

      pollInterval = window.setInterval(() => {
        fetchRequests(false);
      }, 10000);

      document.addEventListener("visibilitychange", handleVisibilityChange);

      channel = supabase
        .channel("demo_requests_realtime")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "demo_requests" },
          (payload) => {
            setRequests((prev) => [payload.new as DemoRequest, ...prev]);
            toast.info("Nouvelle demande reçue !");
          }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "demo_requests" },
          (payload) => {
            setRequests((prev) =>
              prev.map((r) => (r.id === (payload.new as DemoRequest).id ? (payload.new as DemoRequest) : r))
            );
          }
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "demo_requests" },
          (payload) => {
            setRequests((prev) => prev.filter((r) => r.id !== (payload.old as { id: string }).id));
          }
        )
        .subscribe();
    });

    return () => {
      if (channel) supabase.removeChannel(channel);
      if (pollInterval) window.clearInterval(pollInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const stats = {
    total: requests.length,
    actifs: requests.filter((r) => !["non_qualifie", "non_qualifie_p2", "non_interesse", "non_interesse_final"].includes(r.status)).length,
    payes: requests.filter((r) => r.status === "paye").length,
    perdus: requests.filter((r) => ["non_qualifie", "non_qualifie_p2", "non_interesse", "non_interesse_final"].includes(r.status)).length,
  };

  const tabs = [
    { id: "pipeline" as const, label: "Pipeline", icon: BarChart3 },
    { id: "portfolio" as const, label: "Portfolio", icon: FolderOpen },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Code2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-lg">
              Pro<span className="text-secondary">develo</span>
              <span className="text-muted-foreground text-sm ml-2">Admin</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/admin/overview" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <BarChart3 className="w-4 h-4" /> Vue d'ensemble
            </Link>
            <Link to="/admin/licenses" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <KeyRound className="w-4 h-4" /> Licences
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <LogOut className="w-4 h-4" /> Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-8 bg-muted rounded-xl p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "pipeline" && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total", value: stats.total, icon: Eye, color: "text-foreground" },
                { label: "Actifs", value: stats.actifs, icon: Clock, color: "text-blue-600" },
                { label: "Payés", value: stats.payes, icon: CheckCircle, color: "text-green-600" },
                { label: "Perdus", value: stats.perdus, icon: XCircle, color: "text-red-600" },
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
              <h2 className="font-heading text-xl font-bold">Pipeline Commercial</h2>
              <button onClick={() => fetchRequests()} className="flex items-center gap-2 text-sm text-primary hover:underline">
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Actualiser
              </button>
            </div>

            <PipelineBoard requests={requests} onRefresh={fetchRequests} />
          </>
        )}

        {activeTab === "portfolio" && <AdminPortfolio />}
      </main>
    </div>
  );
};

export default AdminDashboard;
