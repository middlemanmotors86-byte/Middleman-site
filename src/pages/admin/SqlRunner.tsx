import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Play, Download, Database } from "lucide-react";
import { toast } from "sonner";

const PRESETS: { label: string; sql: string }[] = [
  { label: "Recent leads (50)", sql: "SELECT id, name, email, phone, program, created_at FROM leads ORDER BY created_at DESC LIMIT 50" },
  { label: "Recent credit apps (50)", sql: "SELECT id, first_name, last_name, email, phone, status, created_at FROM credit_applications ORDER BY created_at DESC LIMIT 50" },
  { label: "Customer profiles (50)", sql: "SELECT email, full_name, phone, lead_count, credit_app_count, updated_at FROM customer_profiles ORDER BY updated_at DESC LIMIT 50" },
  { label: "Login events (50)", sql: "SELECT email, provider, ip_address, created_at FROM login_events ORDER BY created_at DESC LIMIT 50" },
  { label: "Page views today", sql: "SELECT path, count(*) AS views FROM page_views WHERE created_at > now() - interval '1 day' GROUP BY path ORDER BY views DESC" },
  { label: "Funnel events (100)", sql: "SELECT event_name, page, email, created_at FROM funnel_events ORDER BY created_at DESC LIMIT 100" },
  { label: "Inventory queries (50)", sql: "SELECT query, results_count, created_at FROM inventory_queries ORDER BY created_at DESC LIMIT 50" },
  { label: "Row counts (all tables)", sql: `SELECT 'leads' t, count(*) c FROM leads
UNION ALL SELECT 'credit_applications', count(*) FROM credit_applications
UNION ALL SELECT 'customer_profiles', count(*) FROM customer_profiles
UNION ALL SELECT 'login_events', count(*) FROM login_events
UNION ALL SELECT 'page_views', count(*) FROM page_views
UNION ALL SELECT 'funnel_events', count(*) FROM funnel_events
UNION ALL SELECT 'inventory_queries', count(*) FROM inventory_queries
UNION ALL SELECT 'contact_submissions', count(*) FROM contact_submissions
UNION ALL SELECT 'deals', count(*) FROM deals
ORDER BY c DESC` },
];

export default function SqlRunner() {
  const [sql, setSql] = useState(PRESETS[0].sql);
  const [rows, setRows] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState<number | null>(null);

  const run = async () => {
    setLoading(true);
    setElapsed(null);
    const started = performance.now();
    try {
      const { data: resp, error } = await supabase.functions.invoke("admin-sql", { body: { query: sql } });
      if (error) throw error;
      if (resp?.error) throw new Error(resp.error);
      const arr = Array.isArray(resp?.data) ? (resp.data as any[]) : [];
      setRows(arr);
      setColumns(arr.length ? Object.keys(arr[0]) : []);
      setElapsed(Math.round(performance.now() - started));
      toast.success(`${arr.length} row${arr.length === 1 ? "" : "s"}`);
    } catch (e: any) {
      toast.error(e.message ?? "Query failed");
      setRows([]);
      setColumns([]);
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = () => {
    if (!rows.length) return;
    const header = columns.join(",");
    const body = rows
      .map((r) =>
        columns
          .map((c) => {
            const v = r[c];
            if (v == null) return "";
            const s = typeof v === "object" ? JSON.stringify(v) : String(v);
            return `"${s.replace(/"/g, '""')}"`;
          })
          .join(","),
      )
      .join("\n");
    const blob = new Blob([header + "\n" + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `query-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="w-7 h-7 text-primary" /> SQL Runner
          </h1>
          <p className="text-muted-foreground">Run read-only SELECT queries across every table. Admin only.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Presets</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <Button key={p.label} size="sm" variant="outline" onClick={() => setSql(p.sql)}>
                {p.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Query</CardTitle>
            <div className="flex gap-2">
              <Button onClick={run} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                Run
              </Button>
              <Button variant="outline" onClick={exportCsv} disabled={!rows.length}>
                <Download className="w-4 h-4 mr-2" /> CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              className="font-mono text-sm min-h-[160px]"
              placeholder="SELECT * FROM leads LIMIT 10"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Read-only. Statements like INSERT/UPDATE/DELETE/DROP/ALTER are blocked. 15s timeout.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Results</CardTitle>
            <div className="flex items-center gap-2">
              {elapsed != null && <Badge variant="outline">{elapsed} ms</Badge>}
              <Badge>{rows.length} rows</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {rows.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No results yet.</p>
            ) : (
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto border border-border rounded">
                <table className="w-full text-xs">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      {columns.map((c) => (
                        <th key={c} className="text-left px-2 py-2 font-semibold border-b border-border whitespace-nowrap">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                        {columns.map((c) => {
                          const v = r[c];
                          const s = v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
                          return (
                            <td key={c} className="px-2 py-1.5 font-mono whitespace-nowrap max-w-[320px] truncate" title={s}>
                              {s}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
