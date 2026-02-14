import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Code2, LogOut, ArrowLeft, TrendingDown, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";

type DemoRequest = {
  id: string;
  status: string;
  created_at: string;
  payment_amount: number | null;
};

const PHASE_CONFIG = [
  {
    id: 1, label: "Réception", emoji: "🔵",
    statuses: ["nouvelle_demande", "interesse", "non_qualifie"],
    activeStatuses: ["nouvelle_demande", "interesse"],
    lostStatuses: ["non_qualifie"],
  },
  {
    id: 2, label: "Après contact", emoji: "🟡",
    statuses: ["relance", "qualifie", "non_qualifie_p2"],
    activeStatuses: ["relance", "qualifie"],
    lostStatuses: ["non_qualifie_p2"],
  },
  {
    id: 3, label: "Gestion Démo", emoji: "🟠",
    statuses: ["en_discussion", "paiement_en_attente", "non_interesse"],
    activeStatuses: ["en_discussion", "paiement_en_attente"],
    lostStatuses: ["non_interesse"],
  },
  {
    id: 4, label: "Paiement", emoji: "🟢",
    statuses: ["paye", "non_interesse_final"],
    activeStatuses: ["paye"],
    lostStatuses: ["non_interesse_final"],
  },
];

const PipelineOverview = () => {
  const [requests, setRequests] = useState<DemoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/admin/login");
      else fetchData();
    });
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("demo_requests")
      .select("id, status, created_at, payment_amount");
    if (error) toast.error("Erreur de chargement");
    else setRequests(data || []);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  // Compute stats per phase
  const phaseStats = PHASE_CONFIG.map((phase) => {
    const inPhase = requests.filter((r) => phase.statuses.includes(r.status));
    const active = requests.filter((r) => phase.activeStatuses.includes(r.status));
    const lost = requests.filter((r) => phase.lostStatuses.includes(r.status));
    // "Reached" = currently in this phase OR passed through (in later phases)
    const laterStatuses = PHASE_CONFIG.filter((p) => p.id > phase.id).flatMap((p) => p.statuses);
    const reached = inPhase.length + requests.filter((r) => laterStatuses.includes(r.status)).length;
    return { ...phase, total: inPhase.length, active: active.length, lost: lost.length, reached };
  });

  const totalLeads = requests.length;
  const totalPaid = requests.filter((r) => r.status === "paye").length;
  const totalRevenue = requests
    .filter((r) => r.status === "paye" && r.payment_amount)
    .reduce((sum, r) => sum + (r.payment_amount || 0), 0);
  const conversionRate = totalLeads > 0 ? ((totalPaid / totalLeads) * 100).toFixed(1) : "0";

  // Funnel drop-off
  const funnelData = phaseStats.map((ps, i) => {
    const prev = i === 0 ? totalLeads : phaseStats[i - 1].reached;
    const dropOff = prev > 0 ? (((prev - ps.reached) / prev) * 100).toFixed(0) : "0";
    return { ...ps, dropOff, prev };
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/admin")} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Code2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-heading font-bold text-lg">
                Pro<span className="text-secondary">develo</span>
                <span className="text-muted-foreground text-sm ml-2">Vue d'ensemble</span>
              </span>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Chargement...</div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Users className="w-4 h-4" /> Total Leads
                </div>
                <div className="text-2xl font-heading font-bold">{totalLeads}</div>
              </div>
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <TrendingUp className="w-4 h-4" /> Conversions
                </div>
                <div className="text-2xl font-heading font-bold text-green-600">{totalPaid}</div>
              </div>
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <TrendingDown className="w-4 h-4" /> Taux conversion
                </div>
                <div className="text-2xl font-heading font-bold text-primary">{conversionRate}%</div>
              </div>
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  💰 Revenu total
                </div>
                <div className="text-2xl font-heading font-bold text-green-600">{totalRevenue.toLocaleString("fr-FR")} MAD</div>
              </div>
            </div>

            {/* Funnel Visualization */}
            <h2 className="font-heading text-xl font-bold mb-4">Entonnoir de conversion</h2>
            <div className="bg-card rounded-xl border border-border p-6 mb-8">
              <div className="space-y-3">
                {funnelData.map((phase, i) => {
                  const widthPct = totalLeads > 0 ? Math.max(8, (phase.reached / totalLeads) * 100) : 8;
                  return (
                    <div key={phase.id} className="flex items-center gap-4">
                      <div className="w-36 shrink-0 text-sm font-medium">
                        {phase.emoji} Phase {phase.id}
                      </div>
                      <div className="flex-1 relative">
                        <div className="h-10 bg-muted rounded-lg overflow-hidden">
                          <div
                            className="h-full rounded-lg flex items-center px-3 transition-all duration-500"
                            style={{
                              width: `${widthPct}%`,
                              background: `hsl(${120 * (phase.reached / Math.max(totalLeads, 1))}, 60%, 50%)`,
                            }}
                          >
                            <span className="text-white text-xs font-bold whitespace-nowrap">
                              {phase.reached} leads
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="w-24 shrink-0 text-right">
                        {i > 0 && (
                          <span className="text-xs text-red-500 font-medium">
                            ↓ {phase.dropOff}% perdu
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Phase Breakdown */}
            <h2 className="font-heading text-xl font-bold mb-4">Détail par phase</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {phaseStats.map((phase) => (
                <div key={phase.id} className="bg-card rounded-xl border border-border p-5">
                  <div className="text-sm font-heading font-bold mb-3">
                    {phase.emoji} Phase {phase.id} — {phase.label}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Dans cette phase</span>
                      <span className="font-bold">{phase.total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Actifs</span>
                      <span className="font-bold text-blue-600">{phase.active}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Perdus</span>
                      <span className="font-bold text-red-500">{phase.lost}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
                      {phase.total > 0 && (
                        <>
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(phase.active / phase.total) * 100}%` }}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default PipelineOverview;
