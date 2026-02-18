import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface DemoRequest {
  nom: string;
  telephone: string;
  email: string;
  activite: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: DemoRequest = await req.json();

    if (!data.nom || !data.telephone || !data.activite) {
      throw new Error("Champs obligatoires manquants");
    }

    // Store in database
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error: dbError } = await supabaseAdmin.from("demo_requests").insert({
      nom: data.nom,
      telephone: data.telephone,
      email: data.email || null,
      activite: data.activite,
    });

    if (dbError) {
      console.error("DB insert error:", dbError);
    }

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Prodevelo <noreply@prodevelo.com>",
      to: ["lahsen.ecommerce@gmail.com"],
      subject: `Nouvelle demande de démo — ${data.nom}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">🚀 Nouvelle Demande de Démo</h1>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr style="background: #f8fafc;">
              <td style="padding: 12px; font-weight: bold; border: 1px solid #e2e8f0;">Nom</td>
              <td style="padding: 12px; border: 1px solid #e2e8f0;">${data.nom}</td>
            </tr>
            <tr>
              <td style="padding: 12px; font-weight: bold; border: 1px solid #e2e8f0;">Téléphone</td>
              <td style="padding: 12px; border: 1px solid #e2e8f0;">${data.telephone}</td>
            </tr>
            <tr style="background: #f8fafc;">
              <td style="padding: 12px; font-weight: bold; border: 1px solid #e2e8f0;">Email</td>
              <td style="padding: 12px; border: 1px solid #e2e8f0;">${data.email || "Non fourni"}</td>
            </tr>
            <tr>
              <td style="padding: 12px; font-weight: bold; border: 1px solid #e2e8f0;">Activité</td>
              <td style="padding: 12px; border: 1px solid #e2e8f0;">${data.activite}</td>
            </tr>
          </table>

          <p style="margin-top: 20px; color: #64748b; font-size: 12px;">Email envoyé automatiquement depuis prodevelo.com</p>
        </div>
      `,
    });

    console.log("Demo request email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending demo request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
