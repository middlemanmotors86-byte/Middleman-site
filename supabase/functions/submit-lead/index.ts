import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RATE_LIMIT_WINDOW_MINUTES = 15;
const MAX_SUBMISSIONS_PER_WINDOW = 5;

const ALLOWED_SOURCES = new Set([
  "contact_form",
  "website",
  "inventory_inquiry",
  "marketing_campaign",
  "other",
]);

const ALLOWED_TAGS = new Set([
  "financing",
  "government",
  "fleet",
  "general",
  "inventory",
  "marketing",
]);

const clean = (v: unknown, max = 500): string | null => {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t) return null;
  return t.slice(0, max);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = req.headers.get("user-agent") || null;

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const name = clean((body as any).name, 120);
    const email = clean((body as any).email, 255);
    const phone = clean((body as any).phone, 32);
    const message = clean((body as any).message, 2000);

    if (!name) {
      return new Response(JSON.stringify({ error: "Name is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!email && !phone) {
      return new Response(
        JSON.stringify({ error: "Email or phone is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let source = clean((body as any).source, 40) || "website";
    if (!ALLOWED_SOURCES.has(source)) source = "other";

    const rawTags = Array.isArray((body as any).program_tags)
      ? (body as any).program_tags
      : [];
    const program_tags: string[] = [];
    for (const t of rawTags) {
      if (typeof t !== "string") continue;
      const tag = t.trim().toLowerCase().slice(0, 30);
      if (ALLOWED_TAGS.has(tag) && !program_tags.includes(tag)) {
        program_tags.push(tag);
      }
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Rate limit
    const windowStart = new Date(
      Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
    ).toISOString();

    const { data: recent } = await supabase
      .from("rate_limit_tracking")
      .select("id")
      .eq("identifier", clientIP)
      .eq("action", "lead_submission")
      .gte("created_at", windowStart);

    if ((recent?.length || 0) >= MAX_SUBMISSIONS_PER_WINDOW) {
      return new Response(
        JSON.stringify({ error: "Too many submissions. Please try again later." }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { data: lead, error: insertError } = await supabase
      .from("leads")
      .insert({
        name,
        email,
        phone,
        message,
        source,
        program_tags,
        submitted_ip: clientIP,
        submitted_user_agent: userAgent,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Lead insert error:", insertError);
      return new Response(JSON.stringify({ error: "Failed to submit lead" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabase.from("rate_limit_tracking").insert({
      identifier: clientIP,
      action: "lead_submission",
    });

    // Fire funnel event (best-effort)
    supabase.from("funnel_events").insert({
      email,
      step: "lead_submit",
      metadata: { source, program_tags },
      utm_source: clean((body as any).utm_source, 100),
      utm_medium: clean((body as any).utm_medium, 100),
      utm_campaign: clean((body as any).utm_campaign, 100),
      ip_address: clientIP,
      session_id: clean((body as any).session_id, 100),
    }).then(() => {}, (e) => console.warn("funnel insert failed", e));

    // Google Sheets append (best-effort — only fires if configured)
    try {
      await supabase.functions.invoke("sheets-append", {
        body: {
          sheet: "Leads",
          values: [
            new Date().toISOString(),
            name, email ?? "", phone ?? "", source,
            (program_tags ?? []).join("|"),
            clientIP,
          ],
        },
      });
    } catch (e) {
      console.warn("sheets-append failed:", e);
    }

    return new Response(JSON.stringify({ success: true, id: lead.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("submit-lead error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
