// Sends a 24-hour digest of leads / credit apps / funnel activity to
// middlemanmotors86@gmail.com. Uses Resend (RESEND_API_KEY) for delivery.
// Call daily via pg_cron.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DIGEST_TO = "middlemanmotors86@gmail.com";
const DIGEST_FROM = "Middleman Motors <onboarding@resend.dev>";

async function isAuthorized(req: Request): Promise<boolean> {
  // Allow trusted server-to-server callers (pg_cron / internal) via shared secret.
  const cronSecret = Deno.env.get("DIGEST_CRON_SECRET");
  const provided = req.headers.get("x-cron-secret");
  if (cronSecret && provided && provided === cronSecret) return true;

  // Otherwise require an authenticated admin session.
  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return false;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return false;

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data: roleRow } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();
  return !!roleRow;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (!(await isAuthorized(req))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [{ data: leads }, { data: creditApps }, { data: funnel }, { data: emails }] =
      await Promise.all([
        supabase.from("leads").select("*").gte("created_at", since).order("created_at", { ascending: false }),
        supabase.from("credit_applications").select("id, first_name, last_name, email, phone, created_at").gte("created_at", since).order("created_at", { ascending: false }),
        supabase.from("funnel_events").select("step").gte("created_at", since),
        supabase.from("email_captures").select("email, source, created_at").gte("created_at", since).order("created_at", { ascending: false }),
      ]);

    const stepCounts: Record<string, number> = {};
    for (const e of funnel ?? []) stepCounts[e.step] = (stepCounts[e.step] || 0) + 1;

    const html = renderDigest({
      leads: leads ?? [],
      creditApps: creditApps ?? [],
      stepCounts,
      emails: emails ?? [],
    });

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      console.warn("RESEND_API_KEY not set — digest generated but not emailed.");
      // Do NOT return the rendered HTML (contains PII). Return summary counts only.
      return new Response(JSON.stringify({
        ok: true,
        warning: "no email sent — RESEND_API_KEY not configured",
        counts: {
          leads: (leads ?? []).length,
          creditApps: (creditApps ?? []).length,
          emails: (emails ?? []).length,
          funnelEvents: (funnel ?? []).length,
        },
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: DIGEST_FROM,
        to: [DIGEST_TO],
        subject: `Middleman Motors — 24h Lead Digest (${new Date().toLocaleDateString()})`,
        html,
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error("Resend error:", errText);
      return new Response(JSON.stringify({ error: "Email send failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, sentTo: DIGEST_TO }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("daily-lead-digest error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function renderDigest(d: any): string {
  const row = (cells: string[]) =>
    `<tr>${cells.map((c) => `<td style="padding:6px 10px;border-bottom:1px solid #333;font-size:13px;color:#eee">${c}</td>`).join("")}</tr>`;
  const leadRows = d.leads.slice(0, 25).map((l: any) =>
    row([l.name || "—", l.email || "—", l.phone || "—", (l.program_tags || []).join(", "), new Date(l.created_at).toLocaleString()]),
  ).join("");
  const caRows = d.creditApps.slice(0, 25).map((c: any) =>
    row([`${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() || "—", c.email || "—", c.phone || "—", new Date(c.created_at).toLocaleString()]),
  ).join("");
  const funnelRows = Object.entries(d.stepCounts as Record<string, number>)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .map(([k, v]) => row([k, String(v)])).join("");

  return `<!doctype html><html><body style="background:#0b0b0b;font-family:Helvetica,Arial,sans-serif;color:#eee;padding:24px">
    <h2>Middleman Motors — 24h Digest</h2>
    <h3>New Leads (${d.leads.length})</h3>
    <table style="width:100%;border-collapse:collapse">${leadRows || row(["No leads","","","",""])}</table>
    <h3>Credit Applications (${d.creditApps.length})</h3>
    <table style="width:100%;border-collapse:collapse">${caRows || row(["No apps","","",""])}</table>
    <h3>Funnel Events</h3>
    <table style="width:100%;border-collapse:collapse">${funnelRows || row(["None",""])}</table>
  </body></html>`;
}
