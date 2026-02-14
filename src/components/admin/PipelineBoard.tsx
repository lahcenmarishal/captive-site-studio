import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Phone, Mail, Building2, Calendar, Lock, DollarSign, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

type PipelineBoardProps = {
  requests: DemoRequest[];
  onRefresh: () => void;
};

const PHASES = [
  {
    id: 1,
    label: "Réception",
    emoji: "🔵",
    color: "border-blue-400",
    bgHeader: "bg-blue-50 dark:bg-blue-950/30",
    columns: [
      { status: "nouvelle_demande", label: "🆕 Nouvelle demande", bg: "bg-blue-50 dark:bg-blue-900/20" },
      { status: "interesse", label: "✅ Intéressé", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
      { status: "non_qualifie", label: "❌ Non qualifié", bg: "bg-red-50 dark:bg-red-900/20", terminal: true },
    ],
  },
  {
    id: 2,
    label: "Après contact",
    emoji: "🟡",
    color: "border-yellow-400",
    bgHeader: "bg-yellow-50 dark:bg-yellow-950/30",
    columns: [
      { status: "relance", label: "📞 Relance", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
      { status: "qualifie", label: "✅ Qualifié – Prêt pour démo", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
      { status: "non_qualifie_p2", label: "❌ Non qualifié", bg: "bg-red-50 dark:bg-red-900/20", terminal: true },
    ],
  },
  {
    id: 3,
    label: "Gestion Démo",
    emoji: "🟠",
    color: "border-orange-400",
    bgHeader: "bg-orange-50 dark:bg-orange-950/30",
    columns: [
      { status: "en_discussion", label: "💬 En discussion", bg: "bg-orange-50 dark:bg-orange-900/20" },
      { status: "paiement_en_attente", label: "💳 Paiement en attente", bg: "bg-amber-50 dark:bg-amber-900/20" },
      { status: "non_interesse", label: "❌ Non intéressé", bg: "bg-red-50 dark:bg-red-900/20", terminal: true },
    ],
  },
  {
    id: 4,
    label: "Paiement",
    emoji: "🟢",
    color: "border-green-400",
    bgHeader: "bg-green-50 dark:bg-green-950/30",
    columns: [
      { status: "paye", label: "🟢 Payé", bg: "bg-green-50 dark:bg-green-900/20", locked: true },
      { status: "non_interesse_final", label: "❌ Non intéressé", bg: "bg-red-50 dark:bg-red-900/20", terminal: true },
    ],
  },
];

// Map status to allowed next statuses (conditional logic)
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  nouvelle_demande: ["interesse", "non_qualifie"],
  interesse: ["relance", "qualifie", "non_qualifie_p2"],
  relance: ["qualifie", "non_qualifie_p2", "relance"],
  qualifie: ["en_discussion", "paiement_en_attente", "non_interesse"],
  en_discussion: ["paiement_en_attente", "non_interesse"],
  paiement_en_attente: ["paye", "non_interesse_final"],
};

const ALL_STATUSES = PHASES.flatMap((p) => p.columns.map((c) => c.status));

function getPhaseForStatus(status: string) {
  for (const phase of PHASES) {
    if (phase.columns.some((c) => c.status === status)) return phase.id;
  }
  return 1;
}

function daysSince(date: string | null) {
  if (!date) return null;
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
}

const TERMINAL_STATUSES = ["non_qualifie", "non_qualifie_p2", "non_interesse", "non_interesse_final"];

const PipelineBoard = ({ requests, onRefresh }: PipelineBoardProps) => {
  const [movingId, setMovingId] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<DemoRequest | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [deleting, setDeleting] = useState(false);

  const deleteTerminalByPhase = async (phaseId: number) => {
    const phase = PHASES.find((p) => p.id === phaseId);
    if (!phase) return;
    const terminalStatuses = phase.columns.filter((c) => c.terminal).map((c) => c.status);
    const toDelete = requests.filter((r) => terminalStatuses.includes(r.status));
    if (toDelete.length === 0) {
      toast.info("Aucun prospect non qualifié dans cette phase");
      return;
    }
    setDeleting(true);
    const { error } = await supabase
      .from("demo_requests")
      .delete()
      .in("id", toDelete.map((r) => r.id));
    if (error) {
      toast.error("Erreur lors de la suppression");
      console.error(error);
    } else {
      toast.success(`${toDelete.length} prospect(s) supprimé(s)`);
      onRefresh();
    }
    setDeleting(false);
  };
  const moveToStatus = async (request: DemoRequest, newStatus: string) => {
    if (request.is_locked) {
      toast.error("Ce prospect est verrouillé (payé)");
      return;
    }

    const allowed = ALLOWED_TRANSITIONS[request.status];
    if (!allowed?.includes(newStatus)) {
      toast.error("Transition non autorisée");
      return;
    }

    setMovingId(request.id);

    const updateData: Record<string, unknown> = { status: newStatus };

    // Auto-set demo_sent_date when entering Phase 3
    if (newStatus === "en_discussion" || newStatus === "paiement_en_attente") {
      if (!request.demo_sent_date) {
        updateData.demo_sent_date = new Date().toISOString();
      }
    }

    // Lock and set payment info when paid
    if (newStatus === "paye") {
      const amount = parseFloat(paymentAmount);
      if (!amount || amount <= 0) {
        toast.error("Veuillez entrer un montant valide");
        setMovingId(null);
        return;
      }
      updateData.is_locked = true;
      updateData.payment_date = new Date().toISOString();
      updateData.payment_amount = amount;
    }

    const { error } = await supabase
      .from("demo_requests")
      .update(updateData)
      .eq("id", request.id);

    if (error) {
      toast.error("Erreur de mise à jour");
      console.error(error);
    } else {
      toast.success("Statut mis à jour");
      setSelectedCard(null);
      setPaymentAmount("");
    }
    setMovingId(null);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const getRequestsByStatus = (status: string) =>
    requests.filter((r) => r.status === status);

  const renderCard = (r: DemoRequest) => {
    const demoAge = daysSince(r.demo_sent_date);
    const isLocked = r.is_locked;

    return (
      <div
        key={r.id}
        onClick={() => !isLocked && setSelectedCard(r)}
        className={`bg-card border border-border rounded-lg p-3 cursor-pointer hover:shadow-md transition-all text-sm ${
          isLocked ? "opacity-75 cursor-default" : ""
        } ${movingId === r.id ? "opacity-50 animate-pulse" : ""}`}
      >
        <div className="flex items-start justify-between mb-2">
          <span className="font-semibold text-foreground truncate">{r.nom}</span>
          {isLocked && <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
        </div>
        <div className="flex items-center gap-1 text-muted-foreground mb-1">
          <Building2 className="w-3 h-3" />
          <span className="truncate">{r.entreprise}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground mb-1">
          <Phone className="w-3 h-3" />
          <span>{r.telephone}</span>
        </div>
        {r.email && (
          <div className="flex items-center gap-1 text-muted-foreground mb-1">
            <Mail className="w-3 h-3" />
            <span className="truncate">{r.email}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <Badge variant="secondary" className="text-[10px]">{r.service}</Badge>
          {demoAge !== null && (
            <Badge variant="outline" className="text-[10px]">
              <Calendar className="w-2.5 h-2.5 mr-0.5" />
              {demoAge}j
            </Badge>
          )}
          {r.payment_amount && (
            <Badge className="text-[10px] bg-green-100 text-green-800 border-green-200">
              <DollarSign className="w-2.5 h-2.5 mr-0.5" />
              {r.payment_amount} MAD
            </Badge>
          )}
        </div>
        <div className="text-[10px] text-muted-foreground mt-2">{formatDate(r.created_at)}</div>
      </div>
    );
  };

  const nextStatuses = selectedCard ? ALLOWED_TRANSITIONS[selectedCard.status] || [] : [];

  return (
    <div className="space-y-6">
      {PHASES.map((phase) => (
        <div key={phase.id} className={`border-l-4 ${phase.color} rounded-xl overflow-hidden bg-card border border-border`}>
          <div className={`px-4 py-3 ${phase.bgHeader} border-b border-border flex items-center justify-between`}>
            <h3 className="font-heading font-bold text-sm">
              {phase.emoji} PHASE {phase.id} — {phase.label}
            </h3>
            {phase.columns.some((c) => c.terminal) && (
              <button
                onClick={() => deleteTerminalByPhase(phase.id)}
                disabled={deleting}
                className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Supprimer non qualifiés
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-x divide-border">
            {phase.columns.map((col) => {
              const items = getRequestsByStatus(col.status);
              return (
                <div key={col.status} className={`${col.bg} min-h-[120px] p-3`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-foreground">{col.label}</span>
                    <Badge variant="outline" className="text-[10px] h-5">{items.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {items.map(renderCard)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Action Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedCard(null)}>
          <div className="bg-card rounded-2xl border border-border p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-bold">{selectedCard.nom}</h3>
              <button onClick={() => setSelectedCard(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <p><span className="text-muted-foreground">Entreprise :</span> {selectedCard.entreprise}</p>
              <p><span className="text-muted-foreground">Activité :</span> {selectedCard.activite}</p>
              <p><span className="text-muted-foreground">Service :</span> {selectedCard.service}</p>
              <p><span className="text-muted-foreground">Tél :</span> {selectedCard.telephone}</p>
              {selectedCard.email && <p><span className="text-muted-foreground">Email :</span> {selectedCard.email}</p>}
              <p><span className="text-muted-foreground">Timeline :</span> {selectedCard.timeline}</p>
              <p><span className="text-muted-foreground">Date :</span> {formatDate(selectedCard.created_at)}</p>
              {selectedCard.demo_sent_date && (
                <p><span className="text-muted-foreground">Démo envoyée :</span> {formatDate(selectedCard.demo_sent_date)} ({daysSince(selectedCard.demo_sent_date)}j)</p>
              )}
            </div>

            {nextStatuses.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Déplacer vers :</p>

                {nextStatuses.includes("paye") && (
                  <div className="mb-3">
                    <label className="text-xs text-muted-foreground mb-1 block">Montant du paiement (MAD)</label>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Ex: 5000"
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
                    />
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {nextStatuses.map((ns) => {
                    const col = PHASES.flatMap((p) => p.columns).find((c) => c.status === ns);
                    return (
                      <button
                        key={ns}
                        onClick={() => moveToStatus(selectedCard, ns)}
                        disabled={movingId === selectedCard.id}
                        className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted transition-colors disabled:opacity-50"
                      >
                        {col?.label || ns}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {nextStatuses.length === 0 && (
              <p className="text-xs text-muted-foreground italic">Aucune transition disponible (statut terminal).</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PipelineBoard;
