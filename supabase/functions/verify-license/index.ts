import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-request-timestamp, x-request-signature",
};

// ── Rate limiting ─────────────────────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
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

/**
 * Vérifie la signature HMAC-SHA256 de la requête.
 * Payload signé côté client : `${timestamp}.${license_key}.${domain}`
 * Secret partagé : SUPABASE_SERVICE_ROLE_KEY (connu uniquement du serveur)
 */
async function verifyRequestSignature(
  signature: string,
  timestamp: string,
  licenseKey: string,
  domain: string,
  secret: string,
): Promise<{ valid: boolean; reason?: string }> {
  // Anti-replay : rejeter si le timestamp est trop vieux (5 minutes)
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
    await supabase.from("license_api_logs").insert({
      endpoint,
      ...opts,
    });
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
    // ── Rate limit ──────────────────────────────────────────────────────────
    if (!checkRateLimit(clientIp)) {
      await logAccess(supabase, "verify-license", { ip_address: clientIp, status: "rejected", rejection_reason: "Rate limit exceeded" });
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Signature check ─────────────────────────────────────────────────────
    const signature = req.headers.get("x-request-signature");
    const timestamp = req.headers.get("x-request-timestamp");

    const body = await req.json();
    const { license_key, domain } = body;

    if (!license_key || !domain) {
      await logAccess(supabase, "verify-license", { ip_address: clientIp, status: "rejected", rejection_reason: "Missing fields" });
      return new Response(JSON.stringify({ valid: false, error: "Missing license_key or domain" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const keyPrefix = typeof license_key === "string" ? license_key.slice(0, 8) : undefined;
    const normalizedDomain = (domain as string)
      .replace(/^(https?:\/\/)?(www\.)?/, "")
      .replace(/\/.*$/, "")
      .toLowerCase();

    if (!signature || !timestamp) {
      await logAccess(supabase, "verify-license", {
        license_key_prefix: keyPrefix, domain: normalizedDomain, ip_address: clientIp,
        user_agent: userAgent, status: "rejected", rejection_reason: "Missing signature headers",
      });
      return new Response(JSON.stringify({ valid: false, error: "Request signature required" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sigCheck = await verifyRequestSignature(signature, timestamp, license_key, normalizedDomain, secret);
    if (!sigCheck.valid) {
      await logAccess(supabase, "verify-license", {
        license_key_prefix: keyPrefix, domain: normalizedDomain, ip_address: clientIp,
        user_agent: userAgent, status: "rejected", rejection_reason: sigCheck.reason,
        request_timestamp: parseInt(timestamp, 10),
      });
      return new Response(JSON.stringify({ valid: false, error: "Invalid or expired request signature" }), {
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
      await logAccess(supabase, "verify-license", {
        license_key_prefix: keyPrefix, domain: normalizedDomain, ip_address: clientIp,
        user_agent: userAgent, status: "rejected", rejection_reason: "License not found",
      });
      return new Response(JSON.stringify({ valid: false, error: "License not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Status / expiry ──────────────────────────────────────────────────────
    if (license.status !== "active") {
      await logAccess(supabase, "verify-license", {
        license_key_prefix: keyPrefix, domain: normalizedDomain, ip_address: clientIp,
        user_agent: userAgent, status: "rejected", rejection_reason: `License ${license.status}`,
      });
      return new Response(JSON.stringify({ valid: false, error: `License is ${license.status}` }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (license.expiration_date && new Date(license.expiration_date) < new Date()) {
      await supabase.from("licenses").update({ status: "expired" }).eq("id", license.id);
      await logAccess(supabase, "verify-license", {
        license_key_prefix: keyPrefix, domain: normalizedDomain, ip_address: clientIp,
        user_agent: userAgent, status: "rejected", rejection_reason: "License expired",
      });
      return new Response(JSON.stringify({ valid: false, error: "License expired" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Domain check ─────────────────────────────────────────────────────────
    const allowedDomains = (license.allowed_domains || []).map((d: string) => d.toLowerCase());

    if (allowedDomains.length > 0 && !allowedDomains.includes(normalizedDomain)) {
      const { data: activation } = await supabase
        .from("license_activations")
        .select("*")
        .eq("license_id", license.id)
        .eq("domain", normalizedDomain)
        .eq("is_active", true)
        .single();

      if (!activation) {
        await logAccess(supabase, "verify-license", {
          license_key_prefix: keyPrefix, domain: normalizedDomain, ip_address: clientIp,
          user_agent: userAgent, status: "rejected", rejection_reason: "Domain not authorized",
        });
        return new Response(JSON.stringify({ valid: false, error: "Domain not authorized" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ── Issue signed token ────────────────────────────────────────────────────
    const token = await signToken({
      license_id: license.id,
      domain: normalizedDomain,
      product_id: license.product_id,
      exp: Math.floor(Date.now() / 1000) + 86400,
    }, secret);

    await logAccess(supabase, "verify-license", {
      license_key_prefix: keyPrefix, domain: normalizedDomain, ip_address: clientIp,
      user_agent: userAgent, status: "success",
      request_timestamp: parseInt(timestamp, 10),
    });

    return new Response(JSON.stringify({ valid: true, token, expires_in: 86400, license_id: license.id }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("verify-license error:", err);
    await logAccess(supabase, "verify-license", { ip_address: clientIp, status: "error", rejection_reason: err.message });
    return new Response(JSON.stringify({ valid: false, error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
