import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { FileDown, TrendingUp, Users, Eye, CheckCircle2, ExternalLink, QrCode } from "lucide-react";

interface Stats {
  pageViews: number;
  funnelViews: number;
  agreementsAccepted: number;
  leads: number;
}

interface QrStats {
  total: number;
  last7d: number;
  last24h: number;
  attributedLeads: number;
  byCampaign: Array<{ key: string; count: number }>;
  recent: Array<{ id: string; created_at: string; utm_source: string | null; utm_medium: string | null; utm_campaign: string | null; metadata: any }>;
}

const empty: Stats = { pageViews: 0, funnelViews: 0, agreementsAccepted: 0, leads: 0 };
const emptyQr: QrStats = { total: 0, last7d: 0, last24h: 0, attributedLeads: 0, byCampaign: [], recent: [] };

const QuickQualifySOP = () => {
  const [stats, setStats] = useState<Stats>(empty);
  const [qr, setQr] = useState<QrStats>(emptyQr);
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const now = Date.now();
      const iso7 = new Date(now - 7 * 86400_000).toISOString();
      const iso1 = new Date(now - 86400_000).toISOString();

      const [pv, fv, agreed, leads, recentLeads, qrTotal, qr7, qr24, qrRows] = await Promise.all([
        supabase.from("page_views").select("id", { count: "exact", head: true }).ilike("path", "%quick-qualify%"),
        supabase.from("funnel_events").select("id", { count: "exact", head: true }).eq("step", "quick_qualify_view"),
        supabase.from("funnel_events").select("id", { count: "exact", head: true }).eq("step", "quick_qualify_agreement_accepted"),
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("source", "quick_qualify"),
        supabase.from("leads").select("*").eq("source", "quick_qualify").order("created_at", { ascending: false }).limit(15),
        supabase.from("funnel_events").select("id", { count: "exact", head: true }).eq("step", "qr_scan"),
        supabase.from("funnel_events").select("id", { count: "exact", head: true }).eq("step", "qr_scan").gte("created_at", iso7),
        supabase.from("funnel_events").select("id", { count: "exact", head: true }).eq("step", "qr_scan").gte("created_at", iso1),
        supabase.from("funnel_events").select("id, created_at, session_id, utm_source, utm_medium, utm_campaign, metadata").eq("step", "qr_scan").order("created_at", { ascending: false }).limit(500),
      ]);

      // Attributed leads = QR-scan session_ids that also produced a quick_qualify_agreement_accepted
      const sessionIds = Array.from(new Set((qrRows.data ?? []).map((r: any) => r.session_id).filter(Boolean)));
      let attributedLeads = 0;
      if (sessionIds.length) {
        const { count } = await supabase
          .from("funnel_events")
          .select("id", { count: "exact", head: true })
          .eq("step", "quick_qualify_agreement_accepted")
          .in("session_id", sessionIds);
        attributedLeads = count ?? 0;
      }

      const byCampaignMap = new Map<string, number>();
      (qrRows.data ?? []).forEach((r: any) => {
        const key = r.utm_campaign || r.utm_source || "unknown";
        byCampaignMap.set(key, (byCampaignMap.get(key) ?? 0) + 1);
      });
      const byCampaign = Array.from(byCampaignMap.entries())
        .map(([key, count]) => ({ key, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      setStats({
        pageViews: pv.count ?? 0,
        funnelViews: fv.count ?? 0,
        agreementsAccepted: agreed.count ?? 0,
        leads: leads.count ?? 0,
      });
      setQr({
        total: qrTotal.count ?? 0,
        last7d: qr7.count ?? 0,
        last24h: qr24.count ?? 0,
        attributedLeads,
        byCampaign,
        recent: (qrRows.data ?? []).slice(0, 10) as any,
      });
      setRecent(recentLeads.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const conversion = stats.funnelViews > 0
    ? ((stats.agreementsAccepted / stats.funnelViews) * 100).toFixed(1)
    : "0.0";

  const qrConversion = qr.total > 0
    ? ((qr.attributedLeads / qr.total) * 100).toFixed(1)
    : "0.0";

  const cards = [
    { label: "Page Views", value: stats.pageViews, icon: Eye },
    { label: "Funnel Views", value: stats.funnelViews, icon: TrendingUp },
    { label: "Agreements Accepted", value: stats.agreementsAccepted, icon: CheckCircle2 },
    { label: "Leads Captured", value: stats.leads, icon: Users },
  ];

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-foreground">700Credit QuickQualify SOP</h1>
            <p className="text-muted-foreground mt-1">
              Standard operating procedures, live funnel analytics, and dealer user-guide
              for the QuickQualify soft-pull pre-qualification program.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={load} disabled={loading}>Refresh</Button>
            <Button asChild>
              <a href="/pdf/700credit-quickqualify-guide.pdf" target="_blank" rel="noopener">
                <FileDown className="w-4 h-4 mr-2" /> User Guide PDF
              </a>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <Card key={c.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{c.label}</p>
                  <c.icon className="w-4 h-4 text-primary" />
                </div>
                <p className="mt-2 text-3xl font-bold text-foreground">{c.value.toLocaleString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Funnel Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View → Agreement accepted conversion:{" "}
              <span className="font-bold text-primary text-lg">{conversion}%</span>
            </p>
          </CardContent>
        </Card>

        {/* QR Scan Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" /> QR Code Scans
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-xs text-muted-foreground">
              Printed QR codes route through <code>/scan</code> which logs a{" "}
              <code>qr_scan</code> funnel event with UTM attribution, then forwards to 700Credit.
              Use <code>?utm_content=</code> or <code>?loc=</code> on the QR URL to distinguish
              locations (e.g. flyers, lot signage, business cards).
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs text-muted-foreground">Total Scans</p>
                <p className="mt-1 text-3xl font-bold text-foreground">{qr.total.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs text-muted-foreground">Last 7 Days</p>
                <p className="mt-1 text-3xl font-bold text-foreground">{qr.last7d.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs text-muted-foreground">Last 24 Hours</p>
                <p className="mt-1 text-3xl font-bold text-foreground">{qr.last24h.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-primary/40 bg-primary/5 p-4">
                <p className="text-xs text-muted-foreground">QR-Attributed Leads</p>
                <p className="mt-1 text-3xl font-bold text-primary">{qr.attributedLeads.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Scan → agreement conversion: <span className="font-semibold text-foreground">{qrConversion}%</span>
                </p>
              </div>
            </div>

            {qr.byCampaign.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Top campaigns / sources</p>
                <div className="space-y-1.5">
                  {qr.byCampaign.map((c) => (
                    <div key={c.key} className="flex items-center justify-between text-sm border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">{c.key}</span>
                      <Badge variant="secondary">{c.count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {qr.recent.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Recent scans</p>
                <div className="divide-y divide-border text-xs">
                  {qr.recent.map((r) => (
                    <div key={r.id} className="py-2 flex items-center justify-between gap-3">
                      <div className="flex flex-col">
                        <span className="text-foreground">
                          {r.utm_campaign || r.utm_source || "qr_code"}
                          {r?.metadata?.location_tag ? ` · ${r.metadata.location_tag}` : ""}
                        </span>
                        <span className="text-muted-foreground">
                          {r.utm_source}/{r.utm_medium}
                        </span>
                      </div>
                      <span className="text-muted-foreground">
                        {new Date(r.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>


        {/* SOP Playbook */}
        <Card>
          <CardHeader>
            <CardTitle>Standard Operating Procedure</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none text-sm space-y-3">
            <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">Lead capture:</strong> Customer clicks the QuickQualify
                banner (top of homepage, /quick-qualify, /prequalify, or Navbar CTA) and reads the
                soft-pull disclosure.
              </li>
              <li>
                <strong className="text-foreground">Consent:</strong> Customer submits name, email, phone,
                ZIP and checks the FCRA soft-pull consent box. Lead is written to <code>leads</code>{" "}
                with source <code>quick_qualify</code>.
              </li>
              <li>
                <strong className="text-foreground">700Credit soft pull:</strong> Customer is handed off
                to the 700Credit QuickQualify form. Only name + address is transmitted — no full SSN,
                no DOB. Score returns as a soft inquiry (no credit-score impact).
              </li>
              <li>
                <strong className="text-foreground">Notification:</strong> Sales rep receives lead via
                the daily digest email, QuickMobile app, and CRM Hub.
              </li>
              <li>
                <strong className="text-foreground">Follow-up (24h SLA):</strong> Auto task is created
                on the lead. Rep contacts customer with vehicle + payment options.
              </li>
              <li>
                <strong className="text-foreground">Escalate to F&I:</strong> If moving to funding,
                a full credit application is required — QuickQualify soft-pull cannot be used to fund
                a deal (per 700Credit user guide).
              </li>
            </ol>
            <p className="text-xs text-muted-foreground pt-2">
              Reference: 700Credit QuickQualify User Guide v2025.3 (September 2025).{" "}
              <a
                className="text-primary underline"
                href="/700credit-quickqualify-guide.pdf"
                target="_blank"
                rel="noopener"
              >
                Download <ExternalLink className="inline w-3 h-3" />
              </a>
            </p>
          </CardContent>
        </Card>

        {/* Recent leads */}
        <Card>
          <CardHeader>
            <CardTitle>Recent QuickQualify Leads</CardTitle>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">No QuickQualify leads yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {recent.map((l) => (
                  <div key={l.id} className="py-3 flex items-center justify-between gap-4 text-sm">
                    <div>
                      <p className="font-medium text-foreground">
                        {l.first_name} {l.last_name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {l.email} · {l.phone}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">{l.status ?? "new"}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(l.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default QuickQualifySOP;
