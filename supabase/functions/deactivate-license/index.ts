import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { license_key, domain } = await req.json();
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

    const normalizedDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/.*$/, "").toLowerCase();

    // Deactivate
    const { error: deactivateError } = await supabase
      .from("license_activations")
      .update({ is_active: false, deactivated_at: new Date().toISOString() })
      .eq("license_id", license.id)
      .eq("domain", normalizedDomain)
      .eq("is_active", true);

    if (deactivateError) throw deactivateError;

    // Decrement counter
    const newCount = Math.max(0, (license.current_activations || 1) - 1);
    const updatedDomains = (license.allowed_domains || []).filter((d: string) => d.toLowerCase() !== normalizedDomain);
    
    await supabase.from("licenses").update({
      current_activations: newCount,
      allowed_domains: updatedDomains,
    }).eq("id", license.id);

    return new Response(JSON.stringify({ success: true, message: "License deactivated" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("deactivate-license error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
