import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-request-timestamp, x-request-signature",
};

// ── Crypto helpers ────────────────────────────────────────────────────────────
async function hashKey(key: string): Promise<string> {
  const data = new TextEncoder().encode(key);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function verifyRequestSignature(
  signature: string,
  timestamp: string,
  licenseKey: string,
  domain: string,
  secret: string,
): Promise<{ valid: boolean; reason?: string }> {
  const ts = parseInt(timestamp, 10);
  if (isNaN(ts) || Math.abs(Date.now() - ts) > 5 * 60_000) {
    return { valid: false, reason: "Timestamp expired or invalid" };
  }
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]
  );
  const message = enc.encode(`${timestamp}.${licenseKey}.${domain}`);
  const sigBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
  const valid = await crypto.subtle.verify("HMAC", cryptoKey, sigBytes, message);
  return valid ? { valid: true } : { valid: false, reason: "Invalid signature" };
}

// ── Logger ────────────────────────────────────────────────────────────────────
async function logAccess(
  supabase: ReturnType<typeof createClient>,
  endpoint: string,
  opts: {
    license_key_prefix?: string;
    domain?: string;
    ip_address?: string;
    user_agent?: string;
    status: "success" | "rejected" | "error";
    rejection_reason?: string;
  }
) {
  try {
    await supabase.from("license_api_logs").insert({ endpoint, ...opts });
  } catch { /* never block on log failure */ }
}

// ── Main handler ──────────────────────────────────────────────────────────────
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    const signature = req.headers.get("x-request-signature");
    const timestamp = req.headers.get("x-request-timestamp");
    const body = await req.json();
    const { license_key, domain } = body;

    if (!license_key || !domain) {
      return new Response(JSON.stringify({ success: false, error: "Missing required fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const keyPrefix = typeof license_key === "string" ? license_key.slice(0, 8) : undefined;
    const normalizedDomain = (domain as string)
      .replace(/^(https?:\/\/)?(www\.)?/, "")
      .replace(/\/.*$/, "")
      .toLowerCase();

    if (!signature || !timestamp) {
      await logAccess(supabase, "deactivate-license", {
        license_key_prefix: keyPrefix, domain: normalizedDomain, ip_address: clientIp,
        user_agent: userAgent, status: "rejected", rejection_reason: "Missing signature headers",
      });
      return new Response(JSON.stringify({ success: false, error: "Request signature required" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sigCheck = await verifyRequestSignature(signature, timestamp, license_key, normalizedDomain, secret);
    if (!sigCheck.valid) {
      await logAccess(supabase, "deactivate-license", {
        license_key_prefix: keyPrefix, domain: normalizedDomain, ip_address: clientIp,
        user_agent: userAgent, status: "rejected", rejection_reason: sigCheck.reason,
      });
      return new Response(JSON.stringify({ success: false, error: "Invalid or expired request signature" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const keyHash = await hashKey(license_key);
    const { data: license, error } = await supabase
      .from("licenses")
      .select("*")
      .eq("license_key_hash", keyHash)
      .single();

    if (error || !license) {
      return new Response(JSON.stringify({ success: false, error: "Invalid license key" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: deactivateError } = await supabase
      .from("license_activations")
      .update({ is_active: false, deactivated_at: new Date().toISOString() })
      .eq("license_id", license.id)
      .eq("domain", normalizedDomain)
      .eq("is_active", true);

    if (deactivateError) throw deactivateError;

    const newCount = Math.max(0, (license.current_activations || 1) - 1);
    const updatedDomains = (license.allowed_domains || []).filter((d: string) => d.toLowerCase() !== normalizedDomain);

    await supabase.from("licenses").update({
      current_activations: newCount,
      allowed_domains: updatedDomains,
    }).eq("id", license.id);

    await logAccess(supabase, "deactivate-license", {
      license_key_prefix: keyPrefix, domain: normalizedDomain, ip_address: clientIp,
      user_agent: userAgent, status: "success",
    });

    return new Response(JSON.stringify({ success: true, message: "License deactivated" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("deactivate-license error:", err);
    await logAccess(supabase, "deactivate-license", { ip_address: clientIp, status: "error", rejection_reason: err.message });
    return new Response(JSON.stringify({ success: false, error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
