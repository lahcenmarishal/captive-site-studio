import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Code2, LogOut, KeyRound, Plus, Ban, RefreshCw, ArrowLeft, Copy, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type License = {
  id: string;
  license_key_prefix: string;
  email: string;
  product_id: string;
  allowed_domains: string[];
  max_activations: number;
  current_activations: number;
  status: string;
  expiration_date: string | null;
  created_at: string;
};

type Activation = {
  id: string;
  license_id: string;
  domain: string;
  activated_at: string;
  deactivated_at: string | null;
  ip_address: string | null;
  is_active: boolean;
};

const AdminLicenses = () => {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [activations, setActivations] = useState<Activation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newMaxActivations, setNewMaxActivations] = useState("1");
  const [newExpirationDays, setNewExpirationDays] = useState("");
  const navigate = useNavigate();

  const fetchLicenses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("licenses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erreur de chargement des licences");
      console.error(error);
    } else {
      setLicenses((data as any[]) || []);
    }
    setLoading(false);
  };

  const fetchActivations = async (licenseId: string) => {
    const { data } = await supabase
      .from("license_activations")
      .select("*")
      .eq("license_id", licenseId)
      .order("activated_at", { ascending: false });
    setActivations((data as any[]) || []);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/admin/login");
      else fetchLicenses();
    });

    const channel = supabase
      .channel("licenses_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "licenses" }, () => fetchLicenses())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setGeneratedKey(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-license", {
        body: {
          email: newEmail,
          max_activations: parseInt(newMaxActivations) || 1,
          expiration_days: newExpirationDays ? parseInt(newExpirationDays) : null,
        },
      });

      if (error) throw error;
      if (data?.license_key) {
        setGeneratedKey(data.license_key);
        toast.success("Licence générée !");
        fetchLicenses();
      } else {
        toast.error(data?.error || "Erreur de génération");
      }
    } catch (err: any) {
      toast.error(err.message);
    }
    setGenerating(false);
  };

  const handleRevoke = async (id: string) => {
    const { error } = await supabase
      .from("licenses")
      .update({ status: "revoked" })
      .eq("id", id);

    if (error) toast.error("Erreur");
    else {
      toast.success("Licence révoquée");
      fetchLicenses();
    }
  };

  const handleReactivate = async (id: string) => {
    const { error } = await supabase
      .from("licenses")
      .update({ status: "active" })
      .eq("id", id);

    if (error) toast.error("Erreur");
    else {
      toast.success("Licence réactivée");
      fetchLicenses();
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: "bg-green-100 text-green-700",
      revoked: "bg-red-100 text-red-700",
      expired: "bg-yellow-100 text-yellow-700",
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[status] || ""}`}>{status}</span>;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

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
              <span className="text-muted-foreground text-sm ml-2">Licences</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/admin" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Pipeline
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <LogOut className="w-4 h-4" /> Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: licenses.length, color: "text-foreground" },
            { label: "Actives", value: licenses.filter(l => l.status === "active").length, color: "text-green-600" },
            { label: "Révoquées", value: licenses.filter(l => l.status === "revoked").length, color: "text-red-600" },
            { label: "Expirées", value: licenses.filter(l => l.status === "expired").length, color: "text-yellow-600" },
          ].map(s => (
            <div key={s.label} className="bg-card rounded-xl border border-border p-5">
              <div className="text-muted-foreground text-sm mb-1">{s.label}</div>
              <div className={`text-2xl font-heading font-bold ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl font-bold flex items-center gap-2">
            <KeyRound className="w-5 h-5" /> Gestion des Licences
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchLicenses}>
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Actualiser
            </Button>
            <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) { setGeneratedKey(null); setNewEmail(""); setNewMaxActivations("1"); setNewExpirationDays(""); } }}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Générer une licence</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouvelle Licence</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Email client</Label>
                    <Input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="client@example.com" />
                  </div>
                  <div>
                    <Label>Activations max</Label>
                    <Input type="number" value={newMaxActivations} onChange={e => setNewMaxActivations(e.target.value)} min="1" />
                  </div>
                  <div>
                    <Label>Expiration (jours, vide = illimité)</Label>
                    <Input type="number" value={newExpirationDays} onChange={e => setNewExpirationDays(e.target.value)} placeholder="365" />
                  </div>
                  <Button onClick={handleGenerate} disabled={generating} className="w-full">
                    {generating ? "Génération..." : "Générer"}
                  </Button>

                  {generatedKey && (
                    <div className="bg-muted rounded-lg p-4 mt-4">
                      <p className="text-sm text-muted-foreground mb-2">Clé générée (copiez-la maintenant) :</p>
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-lg font-bold text-foreground flex-1">{generatedKey}</code>
                        <Button variant="ghost" size="sm" onClick={() => copyKey(generatedKey)}>
                          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Préfixe</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Activations</TableHead>
                <TableHead>Domaines</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Créée le</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {licenses.map(l => (
                <TableRow key={l.id}>
                  <TableCell className="font-mono text-sm">{l.license_key_prefix}...</TableCell>
                  <TableCell>{l.email}</TableCell>
                  <TableCell>{statusBadge(l.status)}</TableCell>
                  <TableCell>{l.current_activations}/{l.max_activations}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(l.allowed_domains || []).map(d => (
                        <Badge key={d} variant="secondary" className="text-xs">{d}</Badge>
                      ))}
                      {(!l.allowed_domains || l.allowed_domains.length === 0) && <span className="text-muted-foreground text-xs">—</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{l.expiration_date ? new Date(l.expiration_date).toLocaleDateString("fr-FR") : "∞"}</TableCell>
                  <TableCell className="text-sm">{new Date(l.created_at).toLocaleDateString("fr-FR")}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setSelectedLicense(l); fetchActivations(l.id); }}
                      >
                        Logs
                      </Button>
                      {l.status === "active" ? (
                        <Button variant="ghost" size="sm" onClick={() => handleRevoke(l.id)} className="text-destructive">
                          <Ban className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => handleReactivate(l.id)} className="text-green-600">
                          Réactiver
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {licenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Aucune licence créée
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Activations modal */}
        {selectedLicense && (
          <Dialog open={!!selectedLicense} onOpenChange={() => setSelectedLicense(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Logs d'activation — {selectedLicense.license_key_prefix}...</DialogTitle>
              </DialogHeader>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domaine</TableHead>
                    <TableHead>Activé le</TableHead>
                    <TableHead>Désactivé le</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Actif</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activations.map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="font-mono text-sm">{a.domain}</TableCell>
                      <TableCell className="text-sm">{new Date(a.activated_at).toLocaleString("fr-FR")}</TableCell>
                      <TableCell className="text-sm">{a.deactivated_at ? new Date(a.deactivated_at).toLocaleString("fr-FR") : "—"}</TableCell>
                      <TableCell className="text-sm">{a.ip_address || "—"}</TableCell>
                      <TableCell>{a.is_active ? <Badge className="bg-green-100 text-green-700">Oui</Badge> : <Badge variant="secondary">Non</Badge>}</TableCell>
                    </TableRow>
                  ))}
                  {activations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-4">Aucune activation</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
};

export default AdminLicenses;
