// Server-side event tracker. Captures real client IP and forwards to
// login_events / inventory_queries / funnel_events / page_views / email_captures.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type EventKind =
  | "page_view"
  | "login"
  | "inventory_query"
  | "funnel"
  | "email_capture";

const clean = (v: unknown, max = 500): string | null => {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const ip =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;
    const ua = req.headers.get("user-agent") || null;

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return new Response(JSON.stringify({ error: "Bad body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const kind = clean((body as any).kind, 30) as EventKind | null;
    if (!kind) {
      return new Response(JSON.stringify({ error: "kind required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const payload = (body as any).payload || {};
    const common = {
      ip_address: ip,
      user_agent: ua,
      session_id: clean(payload.session_id, 100),
      user_id: clean(payload.user_id, 100),
    };

    switch (kind) {
      case "page_view":
        await supabase.from("page_views").insert({
          path: clean(payload.path, 500) || "/",
          referrer: clean(payload.referrer, 500),
          session_id: common.session_id,
          user_id: common.user_id,
          user_agent: ua,
          ip_address: ip,
          email: clean(payload.email, 255),
          utm_source: clean(payload.utm_source, 100),
          utm_medium: clean(payload.utm_medium, 100),
          utm_campaign: clean(payload.utm_campaign, 100),
          first_utm_source: clean(payload.first_utm_source, 100),
          first_utm_medium: clean(payload.first_utm_medium, 100),
          first_utm_campaign: clean(payload.first_utm_campaign, 100),
        });
        break;

      case "login":
        await supabase.from("login_events").insert({
          user_id: common.user_id,
          email: clean(payload.email, 255),
          provider: clean(payload.provider, 40),
          ip_address: ip,
          user_agent: ua,
          session_id: common.session_id,
          success: payload.success !== false,
        });
        break;

      case "inventory_query":
        await supabase.from("inventory_queries").insert({
          user_id: common.user_id,
          session_id: common.session_id,
          query_type: clean(payload.query_type, 30) || "search",
          search_term: clean(payload.search_term, 300),
          filters: payload.filters ?? null,
          vehicle_id: clean(payload.vehicle_id, 100),
          vehicle_vin: clean(payload.vehicle_vin, 40),
          ip_address: ip,
          user_agent: ua,
        });
        break;

      case "funnel":
        await supabase.from("funnel_events").insert({
          user_id: common.user_id,
          session_id: common.session_id,
          email: clean(payload.email, 255),
          step: clean(payload.step, 60) || "unknown",
          metadata: payload.metadata ?? null,
          utm_source: clean(payload.utm_source, 100),
          utm_medium: clean(payload.utm_medium, 100),
          utm_campaign: clean(payload.utm_campaign, 100),
          ip_address: ip,
        });
        break;

      case "email_capture":
        const email = clean(payload.email, 255);
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return new Response(JSON.stringify({ error: "Invalid email" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        await supabase.from("email_captures").insert({
          email,
          source: clean(payload.source, 60),
          session_id: common.session_id,
          ip_address: ip,
          user_agent: ua,
          utm_source: clean(payload.utm_source, 100),
          utm_medium: clean(payload.utm_medium, 100),
          utm_campaign: clean(payload.utm_campaign, 100),
          referrer: clean(payload.referrer, 500),
        });
        break;
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("track-event error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
