// Admin-only: mint a short-lived signed URL for a sales-jackets storage object,
// or upload a base64 PDF and return the signed URL.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BUCKET = "sales-jackets";
const EXPIRES_SECONDS = 60 * 15; // 15 minutes

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData } = await supabaseAnon.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
    }

    const body = await req.json().catch(() => null);
    if (!body) return new Response(JSON.stringify({ error: "Bad body" }), { status: 400, headers: corsHeaders });

    const action = (body as any).action; // "upload" | "sign"
    const path = (body as any).path as string;

    if (!path || typeof path !== "string") {
      return new Response(JSON.stringify({ error: "path required" }), { status: 400, headers: corsHeaders });
    }

    if (action === "upload") {
      const dataUrl = (body as any).pdfBase64 as string;
      if (!dataUrl) return new Response(JSON.stringify({ error: "pdfBase64 required" }), { status: 400, headers: corsHeaders });
      const b64 = dataUrl.replace(/^data:application\/pdf;base64,/, "");
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const { error: upErr } = await admin.storage.from(BUCKET).upload(path, bytes, {
        contentType: "application/pdf",
        upsert: true,
      });
      if (upErr) throw upErr;
    }

    const { data: signed, error } = await admin.storage
      .from(BUCKET)
      .createSignedUrl(path, EXPIRES_SECONDS);
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, signedUrl: signed.signedUrl, expiresIn: EXPIRES_SECONDS }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("sales-jacket-signed-url error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
