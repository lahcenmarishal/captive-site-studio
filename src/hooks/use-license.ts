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

// ── HMAC-SHA256 request signing ───────────────────────────────────────────────
// The secret used to sign requests is the Supabase anon key (public, but never
// the service role). The server validates using its own copy of the service role key.
// This ensures every request to the license API carries a valid HMAC signature
// and a fresh timestamp, preventing replay attacks.
const SIGNING_SECRET = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

async function hmacSign(message: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(SIGNING_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

/**
 * Build signed headers for a license API call.
 * Signature payload: `${timestamp}.${licenseKey}.${domain}`
 */
async function buildSignedHeaders(licenseKey: string, domain: string) {
  const timestamp = Date.now().toString();
  const signature = await hmacSign(`${timestamp}.${licenseKey}.${domain}`);
  return {
    "x-request-timestamp": timestamp,
    "x-request-signature": signature,
  };
}

// ── Domain helper ─────────────────────────────────────────────────────────────
function getDomain(): string {
  return window.location.hostname.replace(/^www\./, "").toLowerCase();
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useLicense() {
  const [state, setState] = useState<LicenseState>({
    isValid: false,
    isLoading: true,
    error: null,
    licenseKey: null,
  });

  const verifyLicense = useCallback(async (key: string): Promise<boolean> => {
    const domain = getDomain();
    try {
      const signedHeaders = await buildSignedHeaders(key, domain);

      const { data, error } = await supabase.functions.invoke("verify-license", {
        body: { license_key: key, domain },
        headers: signedHeaders,
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
      // Offline fallback: use cached signed token
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
    const domain = getDomain();
    try {
      const signedHeaders = await buildSignedHeaders(key, domain);

      const { data, error } = await supabase.functions.invoke("activate-license", {
        body: { license_key: key, domain, product_id: "prodevelo-template" },
        headers: signedHeaders,
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
    const domain = getDomain();

    try {
      const signedHeaders = await buildSignedHeaders(key, domain);
      await supabase.functions.invoke("deactivate-license", {
        body: { license_key: key, domain },
        headers: signedHeaders,
      });
    } catch { /* ignore network errors on deactivate */ }

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
      // Use cached token as offline fallback
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

    // Periodic re-verification every 24h
    const interval = setInterval(() => {
      const key = localStorage.getItem(LICENSE_STORAGE_KEY);
      if (key) verifyLicense(key);
    }, VERIFY_INTERVAL);

    return () => clearInterval(interval);
  }, [verifyLicense]);

  return { ...state, activateLicense, deactivateLicense, verifyLicense };
}
