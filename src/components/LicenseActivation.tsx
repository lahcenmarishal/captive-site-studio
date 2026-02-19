import { useState } from "react";
import { useLicense } from "@/hooks/use-license";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KeyRound, Loader2, CheckCircle, XCircle } from "lucide-react";

const LicenseActivation = () => {
  const { isValid, isLoading, activateLicense } = useLicense();
  const [key, setKey] = useState("");
  const [activating, setActivating] = useState(false);
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isValid) return null;

  const handleActivate = async () => {
    if (!key.trim()) return;
    setActivating(true);
    setResult(null);
    const res = await activateLicense(key.trim());
    setResult(res);
    setActivating(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-xl">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <KeyRound className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Activation de licence</h1>
          <p className="text-muted-foreground text-sm mt-2 text-center">
            Entrez votre clé de licence pour activer le produit sur ce domaine.
          </p>
        </div>

        <div className="space-y-4">
          <Input
            placeholder="XXXX-XXXX-XXXX-XXXX"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="text-center font-mono tracking-widest text-lg"
            disabled={activating}
          />

          <Button
            onClick={handleActivate}
            disabled={activating || !key.trim()}
            className="w-full"
            size="lg"
          >
            {activating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Activation...
              </>
            ) : (
              "Activer la licence"
            )}
          </Button>

          {result && !result.success && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-lg p-3">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <span>{result.error}</span>
            </div>
          )}

          {result?.success && (
            <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 rounded-lg p-3">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>Licence activée avec succès !</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LicenseActivation;
