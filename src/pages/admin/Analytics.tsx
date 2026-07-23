import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, Eye, UserPlus, CreditCard, TrendingUp, Loader2, Download } from "lucide-react";

function toCSV(rows: Record<string, any>[]): string {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const esc = (v: any) => {
    if (v == null) return "";
    const s = typeof v === "string" ? v : JSON.stringify(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [keys.join(","), ...rows.map((r) => keys.map((k) => esc(r[k])).join(","))].join("\n");
}

function downloadCSV(name: string, rows: Record<string, any>[]) {
  const blob = new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}


type Stats = {
  totalViews: number;
  uniqueSessions: number;
  signedInViews: number;
  leadsCount: number;
  creditAppsCount: number;
  topPaths: { path: string; views: number }[];
  topReferrers: { referrer: string; views: number }[];
  topUtm: { source: string; views: number }[];
};

const WINDOWS = [
  { label: "24h", ms: 1000 * 60 * 60 * 24 },
  { label: "7d", ms: 1000 * 60 * 60 * 24 * 7 },
  { label: "30d", ms: 1000 * 60 * 60 * 24 * 30 },
];

export default function AdminAnalytics() {
  const [windowMs, setWindowMs] = useState(WINDOWS[1].ms);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // CSV export date range (defaults to last 30 days)
  const todayStr = new Date().toISOString().slice(0, 10);
  const monthAgoStr = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const [fromDate, setFromDate] = useState(monthAgoStr);
  const [toDate, setToDate] = useState(todayStr);
  const [exporting, setExporting] = useState<null | "cold" | "app">(null);

  const exportCold = async () => {
    setExporting("cold");
    try {
      const fromIso = new Date(fromDate + "T00:00:00").toISOString();
      const toIso = new Date(toDate + "T23:59:59").toISOString();
      const { data, error } = await supabase
        .from("page_views")
        .select("created_at, path, referrer, session_id, user_id, user_agent, ip_address, email, utm_source, utm_medium, utm_campaign, first_utm_source, first_utm_medium, first_utm_campaign")
        .gte("created_at", fromIso)
        .lte("created_at", toIso)
        .order("created_at", { ascending: false })
        .limit(50000);
      if (error) throw error;

      // Cold = visits from sessions that never submitted a lead or credit app in the range
      const [{ data: leadEmails }, { data: caEmails }] = await Promise.all([
        supabase.from("leads").select("email").gte("created_at", fromIso).lte("created_at", toIso),
        supabase.from("credit_applications").select("email").gte("created_at", fromIso).lte("created_at", toIso),
      ]);
      const submittedEmails = new Set<string>();
      for (const r of leadEmails ?? []) if ((r as any).email) submittedEmails.add(((r as any).email as string).toLowerCase());
      for (const r of caEmails ?? []) if ((r as any).email) submittedEmails.add(((r as any).email as string).toLowerCase());

      const cold = (data ?? []).filter((r: any) => !r.email || !submittedEmails.has(r.email.toLowerCase()));
      downloadCSV(`cold-traffic_${fromDate}_to_${toDate}`, cold);
      toast.success(`Exported ${cold.length} cold traffic rows`);
    } catch (e: any) {
      toast.error(e?.message ?? "Export failed");
    } finally {
      setExporting(null);
    }
  };

  const exportApplications = async () => {
    setExporting("app");
    try {
      const fromIso = new Date(fromDate + "T00:00:00").toISOString();
      const toIso = new Date(toDate + "T23:59:59").toISOString();
      const [leads, apps] = await Promise.all([
        supabase.from("leads")
          .select("*")
          .gte("created_at", fromIso).lte("created_at", toIso)
          .order("created_at", { ascending: false }).limit(50000),
        supabase.from("credit_applications")
          .select("id, created_at, first_name, last_name, email, phone, address, city, state, zip, employer_name, monthly_income, requested_amount, credit_score_range, status")
          .gte("created_at", fromIso).lte("created_at", toIso)
          .order("created_at", { ascending: false }).limit(50000),
      ]);
      if (leads.error) throw leads.error;
      if (apps.error) throw apps.error;

      const combined = [
        ...(leads.data ?? []).map((r: any) => ({ record_type: "lead", ...r })),
        ...(apps.data ?? []).map((r: any) => ({ record_type: "credit_application", ...r })),
      ];
      downloadCSV(`application-traffic_${fromDate}_to_${toDate}`, combined);
      toast.success(`Exported ${combined.length} application rows`);
    } catch (e: any) {
      toast.error(e?.message ?? "Export failed");
    } finally {
      setExporting(null);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const since = new Date(Date.now() - windowMs).toISOString();

      const [pv, leads, creditApps] = await Promise.all([
        supabase
          .from("page_views")
          .select("path, referrer, session_id, user_id, utm_source")
          .gte("created_at", since)
          .limit(10000),
        supabase.from("leads").select("id", { count: "exact", head: true }).gte("created_at", since),
        supabase.from("credit_applications").select("id", { count: "exact", head: true }).gte("created_at", since),
      ]);

      const rows = pv.data ?? [];
      const sessions = new Set<string>();
      const signedIn = new Set<string>();
      const paths = new Map<string, number>();
      const refs = new Map<string, number>();
      const utms = new Map<string, number>();
      for (const r of rows) {
        if (r.session_id) sessions.add(r.session_id);
        if (r.user_id) signedIn.add(r.user_id);
        paths.set(r.path, (paths.get(r.path) || 0) + 1);
        const ref = r.referrer && !r.referrer.includes(location.hostname) ? new URL(r.referrer).hostname : null;
        if (ref) refs.set(ref, (refs.get(ref) || 0) + 1);
        if (r.utm_source) utms.set(r.utm_source, (utms.get(r.utm_source) || 0) + 1);
      }

      const topPaths = [...paths.entries()]
        .map(([path, views]) => ({ path, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 8);
      const topReferrers = [...refs.entries()]
        .map(([referrer, views]) => ({ referrer, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 8);
      const topUtm = [...utms.entries()]
        .map(([source, views]) => ({ source, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 8);

      setStats({
        totalViews: rows.length,
        uniqueSessions: sessions.size,
        signedInViews: rows.filter((r) => r.user_id).length,
        leadsCount: leads.count ?? 0,
        creditAppsCount: creditApps.count ?? 0,
        topPaths,
        topReferrers,
        topUtm,
      });
      setLoading(false);
    })();
  }, [windowMs]);

  const cold = stats ? Math.max(0, stats.uniqueSessions - stats.leadsCount - stats.creditAppsCount) : 0;
  const conversion = stats && stats.uniqueSessions > 0
    ? (((stats.leadsCount + stats.creditAppsCount) / stats.uniqueSessions) * 100).toFixed(1)
    : "0.0";

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Traffic Analytics</h1>
            <p className="text-muted-foreground">
              Separate cold browsing traffic from users engaging your funnel.
            </p>
          </div>
          <div className="flex gap-1 rounded-md border border-border p-1">
            {WINDOWS.map((w) => (
              <button
                key={w.label}
                onClick={() => setWindowMs(w.ms)}
                className={`px-3 py-1 text-sm rounded ${
                  windowMs === w.ms ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Download className="w-4 h-4" /> Export CSV Reports
            </CardTitle>
            <CardDescription>Choose a date range and export cold traffic or application traffic.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <Label htmlFor="fromDate" className="text-xs">From</Label>
                <Input id="fromDate" type="date" value={fromDate} max={toDate}
                  onChange={(e) => setFromDate(e.target.value)} className="w-40" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="toDate" className="text-xs">To</Label>
                <Input id="toDate" type="date" value={toDate} min={fromDate} max={todayStr}
                  onChange={(e) => setToDate(e.target.value)} className="w-40" />
              </div>
              <Button variant="outline" onClick={exportCold} disabled={exporting !== null}>
                <Download className="w-4 h-4 mr-1" />
                {exporting === "cold" ? "Exporting…" : "Cold Traffic CSV"}
              </Button>
              <Button onClick={exportApplications} disabled={exporting !== null}>
                <Download className="w-4 h-4 mr-1" />
                {exporting === "app" ? "Exporting…" : "Application Traffic CSV"}
              </Button>
            </div>
          </CardContent>
        </Card>


        {loading || !stats ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Eye} title="Page Views" value={stats.totalViews} tint="text-blue-500" />
              <StatCard icon={Users} title="Unique Visitors" value={stats.uniqueSessions} tint="text-cyan-500" />
              <StatCard icon={UserPlus} title="Leads Captured" value={stats.leadsCount} tint="text-green-500" />
              <StatCard icon={CreditCard} title="Credit Applications" value={stats.creditAppsCount} tint="text-purple-500" />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-orange-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-500">
                    <Eye className="h-5 w-5" /> Cold Traffic
                  </CardTitle>
                  <CardDescription>Browsed, did not submit anything</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{cold}</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stats.uniqueSessions ? Math.round((cold / stats.uniqueSessions) * 100) : 0}% of visitors
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <UserPlus className="h-5 w-5" /> Application Traffic
                  </CardTitle>
                  <CardDescription>Submitted a lead or credit app</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{stats.leadsCount + stats.creditAppsCount}</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stats.signedInViews} views from signed-in users
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-500">
                    <TrendingUp className="h-5 w-5" /> Conversion Rate
                  </CardTitle>
                  <CardDescription>Visitors → submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{conversion}%</div>
                  <p className="text-sm text-muted-foreground mt-1">Across the selected window</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <TopList title="Top Pages" rows={stats.topPaths.map((r) => ({ label: r.path, value: r.views }))} />
              <TopList title="Top Referrers" rows={stats.topReferrers.map((r) => ({ label: r.referrer, value: r.views }))} empty="No external referrers yet" />
              <TopList title="Top UTM Sources" rows={stats.topUtm.map((r) => ({ label: r.source, value: r.views }))} empty="No tagged campaigns yet" />
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function StatCard({ icon: Icon, title, value, tint }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${tint}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
      </CardContent>
    </Card>
  );
}

function TopList({ title, rows, empty }: { title: string; rows: { label: string; value: number }[]; empty?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">{empty ?? "No data yet"}</p>
        ) : (
          rows.map((r) => (
            <div key={r.label} className="flex justify-between text-sm">
              <span className="truncate mr-2 text-muted-foreground">{r.label}</span>
              <span className="font-medium">{r.value}</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
