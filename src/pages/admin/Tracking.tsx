import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Download, LogIn, Search, GitBranch, Globe, Mail } from "lucide-react";

type Row = Record<string, any>;

function toCSV(rows: Row[]): string {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const esc = (v: any) => {
    if (v == null) return "";
    const s = typeof v === "string" ? v : JSON.stringify(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [keys.join(","), ...rows.map((r) => keys.map((k) => esc(r[k])).join(","))].join("\n");
}

function downloadCSV(name: string, rows: Row[]) {
  const blob = new Blob([toCSV(rows)], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function useTable(table: string, columns = "*", limit = 500, orderCol = "created_at") {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await (supabase.from(table as any) as any)
        .select(columns)
        .order(orderCol, { ascending: false })
        .limit(limit);
      setRows(data ?? []);
      setLoading(false);
    })();
  }, [table, columns, limit, orderCol]);
  return { rows, loading };
}

function Panel({
  title, rows, loading, columns, exportName,
}: { title: string; rows: Row[]; loading: boolean; columns: { key: string; label: string; fmt?: (v: any) => any }[]; exportName: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title} <span className="text-sm text-muted-foreground font-normal">({rows.length})</span></CardTitle>
        <Button size="sm" variant="outline" onClick={() => downloadCSV(exportName, rows)} disabled={!rows.length}>
          <Download className="w-4 h-4 mr-1" /> Export CSV
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" /></div>
        ) : rows.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">No records yet</p>
        ) : (
          <div className="overflow-x-auto max-h-[65vh]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border text-left text-muted-foreground">
                  {columns.map((c) => <th key={c.key} className="py-2 px-2 font-medium">{c.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id || i} className="border-b border-border/50 hover:bg-muted/30">
                    {columns.map((c) => (
                      <td key={c.key} className="py-2 px-2">
                        {c.fmt ? c.fmt(r[c.key]) : (r[c.key] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const fmtDate = (v: any) => v ? new Date(v).toLocaleString() : "—";
const fmtJson = (v: any) => v ? <code className="text-xs">{JSON.stringify(v).slice(0, 80)}</code> : "—";

export default function AdminTracking() {
  const logins = useTable("login_events");
  const queries = useTable("inventory_queries");
  const funnel = useTable("funnel_events");
  const views = useTable("page_views");
  const emails = useTable("email_captures");

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Activity Tracking</h1>
          <p className="text-muted-foreground">Logins, inventory queries, funnel events, cold traffic and email captures.</p>
        </div>

        <Tabs defaultValue="logins">
          <TabsList>
            <TabsTrigger value="logins"><LogIn className="w-4 h-4 mr-1" /> Logins</TabsTrigger>
            <TabsTrigger value="queries"><Search className="w-4 h-4 mr-1" /> Inventory</TabsTrigger>
            <TabsTrigger value="funnel"><GitBranch className="w-4 h-4 mr-1" /> Funnel</TabsTrigger>
            <TabsTrigger value="cold"><Globe className="w-4 h-4 mr-1" /> Cold Traffic</TabsTrigger>
            <TabsTrigger value="emails"><Mail className="w-4 h-4 mr-1" /> Emails</TabsTrigger>
          </TabsList>

          <TabsContent value="logins">
            <Panel title="Login Events" rows={logins.rows} loading={logins.loading} exportName="login-events" columns={[
              { key: "created_at", label: "When", fmt: fmtDate },
              { key: "email", label: "Email" },
              { key: "provider", label: "Provider" },
              { key: "ip_address", label: "IP" },
              { key: "success", label: "OK", fmt: (v) => v ? "✓" : "✗" },
            ]} />
          </TabsContent>

          <TabsContent value="queries">
            <Panel title="Inventory Queries" rows={queries.rows} loading={queries.loading} exportName="inventory-queries" columns={[
              { key: "created_at", label: "When", fmt: fmtDate },
              { key: "query_type", label: "Type" },
              { key: "search_term", label: "Term" },
              { key: "vehicle_id", label: "Vehicle" },
              { key: "filters", label: "Filters", fmt: fmtJson },
              { key: "ip_address", label: "IP" },
            ]} />
          </TabsContent>

          <TabsContent value="funnel">
            <Panel title="Funnel Events" rows={funnel.rows} loading={funnel.loading} exportName="funnel-events" columns={[
              { key: "created_at", label: "When", fmt: fmtDate },
              { key: "step", label: "Step" },
              { key: "email", label: "Email" },
              { key: "utm_source", label: "Source" },
              { key: "utm_campaign", label: "Campaign" },
              { key: "metadata", label: "Meta", fmt: fmtJson },
            ]} />
          </TabsContent>

          <TabsContent value="cold">
            <Panel title="Cold Traffic (Page Views)" rows={views.rows} loading={views.loading} exportName="page-views" columns={[
              { key: "created_at", label: "When", fmt: fmtDate },
              { key: "path", label: "Path" },
              { key: "ip_address", label: "IP" },
              { key: "email", label: "Email" },
              { key: "referrer", label: "Referrer" },
              { key: "utm_source", label: "Source" },
            ]} />
          </TabsContent>

          <TabsContent value="emails">
            <Panel title="Email Captures" rows={emails.rows} loading={emails.loading} exportName="email-captures" columns={[
              { key: "created_at", label: "When", fmt: fmtDate },
              { key: "email", label: "Email" },
              { key: "source", label: "Source" },
              { key: "ip_address", label: "IP" },
              { key: "utm_source", label: "Campaign Source" },
              { key: "referrer", label: "Referrer" },
            ]} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
