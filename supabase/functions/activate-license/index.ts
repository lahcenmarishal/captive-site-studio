import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function signToken(payload: Record<string, unknown>, secret: string): Promise<string> {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(`${header}.${body}`));
  const signature = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return `${header}.${body}.${signature}`;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIp = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(clientIp)) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { license_key, domain, product_id } = await req.json();
    if (!license_key || !domain) {
      return new Response(JSON.stringify({ success: false, error: "Missing required fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const keyHash = await hashKey(license_key);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

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

    if (license.status !== "active") {
      return new Response(JSON.stringify({ success: false, error: `License is ${license.status}` }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (license.expiration_date && new Date(license.expiration_date) < new Date()) {
      await supabase.from("licenses").update({ status: "expired" }).eq("id", license.id);
      return new Response(JSON.stringify({ success: false, error: "License expired" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (product_id && license.product_id !== product_id) {
      return new Response(JSON.stringify({ success: false, error: "Product mismatch" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizedDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/.*$/, "").toLowerCase();

    // Check if already activated for this domain
    const { data: existing } = await supabase
      .from("license_activations")
      .select("*")
      .eq("license_id", license.id)
      .eq("domain", normalizedDomain)
      .eq("is_active", true)
      .single();

    if (existing) {
      const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const token = await signToken({
        license_id: license.id,
        domain: normalizedDomain,
        exp: Math.floor(Date.now() / 1000) + 86400,
      }, secret);

      return new Response(JSON.stringify({ success: true, message: "Already activated", token }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check activation limit
    if (license.current_activations >= license.max_activations) {
      return new Response(JSON.stringify({ success: false, error: "Maximum activations reached" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Activate
    const { error: activationError } = await supabase.from("license_activations").insert({
      license_id: license.id,
      domain: normalizedDomain,
      ip_address: clientIp,
      user_agent: req.headers.get("user-agent") || "unknown",
    });

    if (activationError) throw activationError;

    // Update activation count and allowed_domains
    const updatedDomains = [...new Set([...(license.allowed_domains || []), normalizedDomain])];
    await supabase.from("licenses").update({
      current_activations: license.current_activations + 1,
      allowed_domains: updatedDomains,
    }).eq("id", license.id);

    const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const token = await signToken({
      license_id: license.id,
      domain: normalizedDomain,
      exp: Math.floor(Date.now() / 1000) + 86400,
    }, secret);

    return new Response(JSON.stringify({
      success: true,
      message: "License activated successfully",
      token,
      expires_in: 86400,
    }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("activate-license error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
