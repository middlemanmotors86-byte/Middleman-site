// Thin client that fires events to the track-event edge function.
// The edge function captures the real client IP server-side.
import { supabase } from "@/integrations/supabase/client";
import { getFirstTouch, getLastTouch, getSessionId } from "./attribution";

async function send(kind: string, payload: Record<string, unknown>) {
  try {
    const first = getFirstTouch();
    const last = getLastTouch();
    const enriched = {
      session_id: getSessionId(),
      first_utm_source: first?.utm_source ?? null,
      first_utm_medium: first?.utm_medium ?? null,
      first_utm_campaign: first?.utm_campaign ?? null,
      utm_source: last?.utm_source ?? null,
      utm_medium: last?.utm_medium ?? null,
      utm_campaign: last?.utm_campaign ?? null,
      ...payload,
    };
    await supabase.functions.invoke("track-event", { body: { kind, payload: enriched } });
  } catch (err) {
    console.warn("track-event failed:", err);
  }

  // Mirror to Google Analytics (gtag) if present
  try {
    const w = window as any;
    if (typeof w.gtag === "function") {
      w.gtag("event", kind, payload);
    }
  } catch { /* noop */ }
}

export const track = {
  pageView: (path: string) => send("page_view", { path, referrer: document.referrer || null }),
  login: (email: string | null, provider: string, success = true) =>
    send("login", { email, provider, success }),
  inventoryQuery: (data: {
    query_type: "search" | "filter" | "view" | "compare";
    search_term?: string;
    filters?: Record<string, unknown>;
    vehicle_id?: string;
    vehicle_vin?: string;
  }) => send("inventory_query", data),
  funnel: (step: string, metadata: Record<string, unknown> = {}, email?: string | null) =>
    send("funnel", { step, metadata, email: email ?? null }),
  emailCapture: (email: string, source: string) =>
    send("email_capture", { email, source, referrer: document.referrer || null }),
};
