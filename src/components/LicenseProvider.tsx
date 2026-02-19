import { createContext, useContext, ReactNode } from "react";
import { useLicense } from "@/hooks/use-license";
import LicenseActivation from "@/components/LicenseActivation";
import { Loader2 } from "lucide-react";

interface LicenseContextType {
  isValid: boolean;
  licenseKey: string | null;
  deactivateLicense: () => Promise<boolean>;
}

const LicenseContext = createContext<LicenseContextType>({
  isValid: false,
  licenseKey: null,
  deactivateLicense: async () => false,
});

export const useLicenseContext = () => useContext(LicenseContext);

export const LicenseProvider = ({ children }: { children: ReactNode }) => {
  const { isValid, isLoading, licenseKey, deactivateLicense } = useLicense();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isValid) {
    return <LicenseActivation />;
  }

  return (
    <LicenseContext.Provider value={{ isValid, licenseKey, deactivateLicense }}>
      {children}
    </LicenseContext.Provider>
  );
};
