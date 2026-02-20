import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-request-timestamp, x-request-signature",
};

// ── Rate limiting ─────────────────────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

// ── Crypto helpers ────────────────────────────────────────────────────────────
async function hashKey(key: string): Promise<string> {
  const data = new TextEncoder().encode(key);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function signToken(payload: Record<string, unknown>, secret: string): Promise<string> {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(`${header}.${body}`));
  return `${header}.${body}.${btoa(String.fromCharCode(...new Uint8Array(sig)))}`;
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
    request_timestamp?: number;
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
    if (!checkRateLimit(clientIp)) {
      await logAccess(supabase, "activate-license", { ip_address: clientIp, status: "rejected", rejection_reason: "Rate limit exceeded" });
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const signature = req.headers.get("x-request-signature");
    const timestamp = req.headers.get("x-request-timestamp");
    const body = await req.json();
    const { license_key, domain, product_id } = body;

    if (!license_key || !domain) {
      await logAccess(supabase, "activate-license", { ip_address: clientIp, status: "rejected", rejection_reason: "Missing fields" });
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
      await logAccess(supabase, "activate-license", {
        license_key_prefix: keyPrefix, domain: normalizedDomain, ip_address: clientIp,
        user_agent: userAgent, status: "rejected", rejection_reason: "Missing signature headers",
      });
      return new Response(JSON.stringify({ success: false, error: "Request signature required" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sigCheck = await verifyRequestSignature(signature, timestamp, license_key, normalizedDomain, secret);
    if (!sigCheck.valid) {
      await logAccess(supabase, "activate-license", {
        license_key_prefix: keyPrefix, domain: normalizedDomain, ip_address: clientIp,
        user_agent: userAgent, status: "rejected", rejection_reason: sigCheck.reason,
        request_timestamp: parseInt(timestamp, 10),
      });
      return new Response(JSON.stringify({ success: false, error: "Invalid or expired request signature" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── DB lookup ────────────────────────────────────────────────────────────
    const keyHash = await hashKey(license_key);
    const { data: license, error } = await supabase
      .from("licenses")
      .select("*")
      .eq("license_key_hash", keyHash)
      .single();

    if (error || !license) {
      await logAccess(supabase, "activate-license", {
        license_key_prefix: keyPrefix, domain: normalizedDomain, ip_address: clientIp,
        user_agent: userAgent, status: "rejected", rejection_reason: "Invalid license key",
      });
      return new Response(JSON.stringify({ success: false, error: "Invalid license key" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (license.status !== "active") {
      await logAccess(supabase, "activate-license", {
        license_key_prefix: keyPrefix, domain: normalizedDomain, ip_address: clientIp,
        user_agent: userAgent, status: "rejected", rejection_reason: `License ${license.status}`,
      });
      return new Response(JSON.stringify({ success: false, error: `License is ${license.status}` }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (license.expiration_date && new Date(license.expiration_date) < new Date()) {
      await supabase.from("licenses").update({ status: "expired" }).eq("id", license.id);
      await logAccess(supabase, "activate-license", {
        license_key_prefix: keyPrefix, domain: normalizedDomain, ip_address: clientIp,
        user_agent: userAgent, status: "rejected", rejection_reason: "License expired",
      });
      return new Response(JSON.stringify({ success: false, error: "License expired" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (product_id && license.product_id !== product_id) {
      await logAccess(supabase, "activate-license", {
        license_key_prefix: keyPrefix, domain: normalizedDomain, ip_address: clientIp,
        user_agent: userAgent, status: "rejected", rejection_reason: "Product mismatch",
      });
      return new Response(JSON.stringify({ success: false, error: "Product mismatch" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Already activated? ────────────────────────────────────────────────────
    const { data: existing } = await supabase
      .from("license_activations")
      .select("*")
      .eq("license_id", license.id)
      .eq("domain", normalizedDomain)
      .eq("is_active", true)
      .single();

    if (existing) {
      const token = await signToken({
        license_id: license.id,
        domain: normalizedDomain,
        product_id: license.product_id,
        exp: Math.floor(Date.now() / 1000) + 86400,
      }, secret);
      await logAccess(supabase, "activate-license", {
        license_key_prefix: keyPrefix, domain: normalizedDomain, ip_address: clientIp,
        user_agent: userAgent, status: "success",
      });
      return new Response(JSON.stringify({ success: true, message: "Already activated", token }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Activation limit check ────────────────────────────────────────────────
    if (license.current_activations >= license.max_activations) {
      await logAccess(supabase, "activate-license", {
        license_key_prefix: keyPrefix, domain: normalizedDomain, ip_address: clientIp,
        user_agent: userAgent, status: "rejected", rejection_reason: "Max activations reached",
      });
      return new Response(JSON.stringify({ success: false, error: "Maximum activations reached" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Activate ──────────────────────────────────────────────────────────────
    const { error: activationError } = await supabase.from("license_activations").insert({
      license_id: license.id,
      domain: normalizedDomain,
      ip_address: clientIp,
      user_agent: userAgent,
    });

    if (activationError) throw activationError;

    const updatedDomains = [...new Set([...(license.allowed_domains || []), normalizedDomain])];
    await supabase.from("licenses").update({
      current_activations: license.current_activations + 1,
      allowed_domains: updatedDomains,
    }).eq("id", license.id);

    const token = await signToken({
      license_id: license.id,
      domain: normalizedDomain,
      product_id: license.product_id,
      exp: Math.floor(Date.now() / 1000) + 86400,
    }, secret);

    await logAccess(supabase, "activate-license", {
      license_key_prefix: keyPrefix, domain: normalizedDomain, ip_address: clientIp,
      user_agent: userAgent, status: "success",
    });

    return new Response(JSON.stringify({ success: true, message: "License activated successfully", token, expires_in: 86400 }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("activate-license error:", err);
    await logAccess(supabase, "activate-license", { ip_address: clientIp, status: "error", rejection_reason: err.message });
    return new Response(JSON.stringify({ success: false, error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
