// Marketing attribution: first-touch (persisted forever) + last-touch (updated on each visit).
// Read once per session and attached to every lead / credit app / funnel event.

const FIRST_KEY = "mm_first_touch";
const LAST_KEY = "mm_last_touch";

export interface Attribution {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
  landing_path: string | null;
  timestamp: string;
}

function fromSearch(search: string): Partial<Attribution> {
  const p = new URLSearchParams(search);
  return {
    utm_source: p.get("utm_source"),
    utm_medium: p.get("utm_medium"),
    utm_campaign: p.get("utm_campaign"),
  };
}

/** Call once on app load. Persists first-touch forever and updates last-touch. */
export function captureAttribution() {
  try {
    const params = fromSearch(window.location.search);
    const hasUtm = params.utm_source || params.utm_medium || params.utm_campaign;
    const ref = document.referrer && !document.referrer.includes(window.location.hostname)
      ? document.referrer
      : null;

    const now: Attribution = {
      utm_source: params.utm_source ?? null,
      utm_medium: params.utm_medium ?? null,
      utm_campaign: params.utm_campaign ?? null,
      referrer: ref,
      landing_path: window.location.pathname,
      timestamp: new Date().toISOString(),
    };

    if (!localStorage.getItem(FIRST_KEY) && (hasUtm || ref)) {
      localStorage.setItem(FIRST_KEY, JSON.stringify(now));
    }
    if (hasUtm || ref) {
      localStorage.setItem(LAST_KEY, JSON.stringify(now));
    }
  } catch {
    /* noop */
  }
}

export function getFirstTouch(): Attribution | null {
  try { return JSON.parse(localStorage.getItem(FIRST_KEY) || "null"); } catch { return null; }
}

export function getLastTouch(): Attribution | null {
  try { return JSON.parse(localStorage.getItem(LAST_KEY) || "null"); } catch { return null; }
}

export function getSessionId(): string {
  let id = localStorage.getItem("mm_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("mm_session_id", id);
  }
  return id;
}
