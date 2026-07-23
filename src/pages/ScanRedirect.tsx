import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * /scan — QR code landing page.
 * Logs a funnel_event for the scan (with UTM attribution), then forwards
 * the visitor to the 700Credit QuickQualify soft-pull page with UTMs
 * preserved so downstream analytics see the same campaign.
 */
const DESTINATION = "https://www.quickqualify.com/dealer/middlemanmotors";

const getOrCreateSessionId = () => {
  try {
    const k = "mm_session_id";
    let sid = localStorage.getItem(k);
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem(k, sid);
    }
    return sid;
  } catch {
    return crypto.randomUUID();
  }
};

const ScanRedirect = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utm_source = params.get("utm_source") || "qr_code";
    const utm_medium = params.get("utm_medium") || "print";
    const utm_campaign = params.get("utm_campaign") || "softpull_prequalify";
    const utm_content = params.get("utm_content") || null;
    const location_tag = params.get("loc") || null;

    const forward = new URL(DESTINATION);
    forward.searchParams.set("utm_source", utm_source);
    forward.searchParams.set("utm_medium", utm_medium);
    forward.searchParams.set("utm_campaign", utm_campaign);
    if (utm_content) forward.searchParams.set("utm_content", utm_content);

    const sessionId = getOrCreateSessionId();

    // Fire-and-forget log then redirect.
    (async () => {
      try {
        await supabase.from("funnel_events").insert({
          session_id: sessionId,
          step: "qr_scan",
          utm_source,
          utm_medium,
          utm_campaign,
          metadata: {
            utm_content,
            location_tag,
            referrer: document.referrer || null,
            user_agent: navigator.userAgent,
            destination: forward.toString(),
          },
        });
      } catch {
        // ignore — never block redirect on logging
      } finally {
        window.location.replace(forward.toString());
      }
    })();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <h1 className="font-heading text-xl font-semibold">Opening pre-qualification…</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Redirecting you to Middleman Motors' 700Credit soft-pull.
        </p>
      </div>
    </main>
  );
};

export default ScanRedirect;
