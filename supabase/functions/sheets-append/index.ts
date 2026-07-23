// Appends a row to a Google Sheet via the Lovable connector gateway.
// Requires: (1) Google Sheets connector linked, (2) GOOGLE_SHEETS_ID stored
// in integration_settings, (3) LOVABLE_API_KEY + GOOGLE_SHEETS_API_KEY secrets.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY = "https://connector-gateway.lovable.dev/google_sheets/v4";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Require an authenticated admin session (or trusted server-to-server shared secret).
    const sharedSecret = Deno.env.get("SHEETS_APPEND_SECRET");
    const providedSecret = req.headers.get("x-shared-secret");
    let authorized = !!(sharedSecret && providedSecret && providedSecret === sharedSecret);

    if (!authorized) {
      const authHeader = req.headers.get("Authorization") || "";
      if (authHeader.startsWith("Bearer ")) {
        const authClient = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_ANON_KEY")!,
          { global: { headers: { Authorization: authHeader } } },
        );
        const { data: userData } = await authClient.auth.getUser();
        if (userData?.user) {
          const adminClient = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
          );
          const { data: roleRow } = await adminClient
            .from("user_roles")
            .select("role")
            .eq("user_id", userData.user.id)
            .eq("role", "admin")
            .maybeSingle();
          authorized = !!roleRow;
        }
      }
    }

    if (!authorized) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return new Response(JSON.stringify({ error: "Bad body" }), { status: 400, headers: corsHeaders });
    }

    const rawSheet = (body as any).sheet;
    // Restrict tab name to safe characters (letters, digits, space, _, -).
    const sheet = typeof rawSheet === "string" && /^[A-Za-z0-9 _-]{1,64}$/.test(rawSheet)
      ? rawSheet
      : "Leads";
    const rawValues = (body as any).values;
    if (!Array.isArray(rawValues)) {
      return new Response(JSON.stringify({ error: "values[] required" }), { status: 400, headers: corsHeaders });
    }
    // Neutralize formula/CSV-injection triggers on any leading character.
    const values = rawValues.map((v: unknown) => {
      if (v === null || v === undefined) return "";
      const s = typeof v === "string" ? v : String(v);
      return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: setting } = await supabase
      .from("integration_settings")
      .select("value")
      .eq("key", "GOOGLE_SHEETS_ID")
      .maybeSingle();

    const sheetId = setting?.value;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    const sheetsKey = Deno.env.get("GOOGLE_SHEETS_API_KEY");

    if (!sheetId || !lovableKey || !sheetsKey) {
      return new Response(JSON.stringify({
        error: "Google Sheets not configured",
        hint: "Connect Google Sheets in Connectors and set GOOGLE_SHEETS_ID in admin settings.",
      }), { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const range = `${sheet}!A1`;
    const url = `${GATEWAY}/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=USER_ENTERED`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": sheetsKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: [values] }),
    });

    if (!res.ok) {
      const t = await res.text();
      console.error("Sheets append failed:", res.status, t);
      return new Response(JSON.stringify({ error: "Sheet append failed", status: res.status, details: t }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("sheets-append error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
