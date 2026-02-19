import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const LICENSE_STORAGE_KEY = "prodevelo_license";
const TOKEN_STORAGE_KEY = "prodevelo_license_token";
const VERIFY_INTERVAL = 24 * 60 * 60 * 1000; // 24h
const LAST_VERIFY_KEY = "prodevelo_last_verify";

interface LicenseState {
  isValid: boolean;
  isLoading: boolean;
  error: string | null;
  licenseKey: string | null;
}

export function useLicense() {
  const [state, setState] = useState<LicenseState>({
    isValid: false,
    isLoading: true,
    error: null,
    licenseKey: null,
  });

  const getDomain = () => {
    return window.location.hostname.replace(/^www\./, "").toLowerCase();
  };

  const verifyLicense = useCallback(async (key: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke("verify-license", {
        body: { license_key: key, domain: getDomain() },
      });

      if (error) throw error;

      if (data?.valid) {
        localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
        localStorage.setItem(LAST_VERIFY_KEY, Date.now().toString());
        setState({ isValid: true, isLoading: false, error: null, licenseKey: key });
        return true;
      } else {
        setState({ isValid: false, isLoading: false, error: data?.error || "Licence invalide", licenseKey: key });
        return false;
      }
    } catch {
      // Offline fallback: check stored token
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          if (payload.exp > Date.now() / 1000) {
            setState({ isValid: true, isLoading: false, error: null, licenseKey: key });
            return true;
          }
        } catch { /* invalid token */ }
      }
      setState({ isValid: false, isLoading: false, error: "Impossible de vérifier la licence", licenseKey: key });
      return false;
    }
  }, []);

  const activateLicense = useCallback(async (key: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke("activate-license", {
        body: { license_key: key, domain: getDomain(), product_id: "prodevelo-template" },
      });

      if (error) throw error;

      if (data?.success) {
        localStorage.setItem(LICENSE_STORAGE_KEY, key);
        localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
        localStorage.setItem(LAST_VERIFY_KEY, Date.now().toString());
        setState({ isValid: true, isLoading: false, error: null, licenseKey: key });
        return { success: true };
      }
      return { success: false, error: data?.error || "Échec d'activation" };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, []);

  const deactivateLicense = useCallback(async (): Promise<boolean> => {
    const key = localStorage.getItem(LICENSE_STORAGE_KEY);
    if (!key) return false;

    try {
      await supabase.functions.invoke("deactivate-license", {
        body: { license_key: key, domain: getDomain() },
      });
    } catch { /* ignore */ }

    localStorage.removeItem(LICENSE_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(LAST_VERIFY_KEY);
    setState({ isValid: false, isLoading: false, error: null, licenseKey: null });
    return true;
  }, []);

  // Auto-verify on mount and periodically
  useEffect(() => {
    const storedKey = localStorage.getItem(LICENSE_STORAGE_KEY);
    if (!storedKey) {
      setState({ isValid: false, isLoading: false, error: null, licenseKey: null });
      return;
    }

    const lastVerify = parseInt(localStorage.getItem(LAST_VERIFY_KEY) || "0");
    const needsVerify = Date.now() - lastVerify > VERIFY_INTERVAL;

    if (needsVerify) {
      verifyLicense(storedKey);
    } else {
      // Use cached token
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          if (payload.exp > Date.now() / 1000) {
            setState({ isValid: true, isLoading: false, error: null, licenseKey: storedKey });
            return;
          }
        } catch { /* invalid */ }
      }
      verifyLicense(storedKey);
    }

    // Periodic check
    const interval = setInterval(() => {
      const key = localStorage.getItem(LICENSE_STORAGE_KEY);
      if (key) verifyLicense(key);
    }, VERIFY_INTERVAL);

    return () => clearInterval(interval);
  }, [verifyLicense]);

  return { ...state, activateLicense, deactivateLicense, verifyLicense };
}
