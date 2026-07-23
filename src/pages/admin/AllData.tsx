import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users, UserPlus, CreditCard, MessageSquare, Eye, Activity, GitPullRequest,
  Car, FolderOpen, Archive, BarChart3, UserCog, Briefcase, LogIn, FileText, Search, Plug,
} from "lucide-react";

type TabKey = "leads" | "customer_profiles" | "credit_applications" | "inventory_queries";

const TAB_CONFIG: Record<TabKey, { label: string; href: string; columns: { key: string; label: string }[] }> = {
  leads: {
    label: "Leads",
    href: "/admin/leads",
    columns: [
      { key: "created_at", label: "Created" },
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "program", label: "Program" },
    ],
  },
  customer_profiles: {
    label: "Customer Profiles",
    href: "/admin/customer-profiles",
    columns: [
      { key: "created_at", label: "Created" },
      { key: "full_name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "first_source", label: "Source" },
      { key: "lead_count", label: "Leads" },
    ],
  },
  credit_applications: {
    label: "Credit Applications",
    href: "/admin/credit-applications",
    columns: [
      { key: "created_at", label: "Created" },
      { key: "first_name", label: "First" },
      { key: "last_name", label: "Last" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "status", label: "Status" },
    ],
  },
  inventory_queries: {
    label: "Inventory Queries",
    href: "/admin/inventory-lookup",
    columns: [
      { key: "created_at", label: "Created" },
      { key: "make", label: "Make" },
      { key: "model", label: "Model" },
      { key: "year", label: "Year" },
      { key: "vin", label: "VIN" },
      { key: "results_count", label: "Results" },
    ],
  },
};

interface Stat {
  label: string;
  value: number | string;
  href: string;
  icon: any;
  hint?: string;
}

export default function AllData() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const counts = async (table: string) => {
        const { count } = await supabase.from(table as any).select("*", { count: "exact", head: true });
        return count ?? 0;
      };

      const [
        leads, credit, contacts, pageViews, funnel, login, invQ,
        deals, docs, profiles, portfolio, jackets, users,
      ] = await Promise.all([
        counts("leads"),
        counts("credit_applications"),
        counts("contact_submissions"),
        counts("page_views"),
        counts("funnel_events"),
        counts("login_events"),
        counts("inventory_queries"),
        counts("deals"),
        counts("document_uploads"),
        counts("customer_profiles"),
        counts("portfolio_buyers"),
        counts("sales_jacket_sends"),
        counts("user_roles"),
      ]);

      setStats([
        { label: "Leads", value: leads, href: "/admin/leads", icon: UserPlus, hint: "Website + Marketing + Inventory" },
        { label: "Credit Applications", value: credit, href: "/admin/credit-applications", icon: CreditCard },
        { label: "Contact Submissions", value: contacts, href: "/admin/contacts", icon: MessageSquare },
        { label: "Page Views (cold traffic)", value: pageViews, href: "/admin/analytics", icon: Eye },
        { label: "Funnel Events", value: funnel, href: "/admin/tracking", icon: Activity },
        { label: "Login Events", value: login, href: "/admin/tracking", icon: LogIn },
        { label: "Inventory Queries", value: invQ, href: "/admin/inventory-lookup", icon: Search },
        { label: "Deals in Pipeline", value: deals, href: "/admin/pipeline", icon: GitPullRequest },
        { label: "Documents", value: docs, href: "/admin/documents", icon: FolderOpen },
        { label: "Customer Profiles", value: profiles, href: "/admin/customer-profiles", icon: UserCog },
        { label: "Portfolio Buyers", value: portfolio, href: "/admin/portfolio-buyers", icon: Briefcase },
        { label: "Sales Jackets Sent", value: jackets, href: "/admin/pipeline", icon: FileText },
        { label: "Admin/Finance Users", value: users, href: "/admin/users", icon: Users },
      ]);
      setLoading(false);
    })();
  }, []);

  const shortcuts = [
    { label: "Traffic Analytics", href: "/admin/analytics", icon: BarChart3 },
    { label: "Activity Tracking", href: "/admin/tracking", icon: Activity },
    { label: "Archive Viewer", href: "/admin/archives", icon: Archive },
    { label: "Inventory Lookup", href: "/admin/inventory-lookup", icon: Search },
    { label: "Sales Pipeline", href: "/admin/pipeline", icon: GitPullRequest },
    { label: "Integrations", href: "/admin/integrations", icon: Plug },
    { label: "Inventory", href: "/admin/inventory", icon: Car },
    { label: "Manage Admins", href: "/admin/users", icon: Users },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">All Data</h1>
          <p className="text-muted-foreground">Live counts across every system. Click any tile to drill in.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Link key={s.label} to={s.href}>
              <Card className="hover:border-primary/50 transition-colors h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                    <s.icon className="w-4 h-4" />
                    {s.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {loading ? "…" : s.value.toLocaleString()}
                  </div>
                  {s.hint && <div className="text-xs text-muted-foreground mt-1">{s.hint}</div>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Data Explorer</h2>
          <DataTabs />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Shortcuts</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {shortcuts.map((s) => (
              <Link
                key={s.href}
                to={s.href}
                className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 hover:border-primary/50 transition-colors"
              >
                <s.icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{s.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

const PAGE_SIZE = 25;

function DataTabs() {
  const [active, setActive] = useState<TabKey>("leads");
  const [selected, setSelected] = useState<{ table: TabKey; row: any } | null>(null);
  const [counts, setCounts] = useState<Record<TabKey, number | null>>({
    leads: null, customer_profiles: null, credit_applications: null, inventory_queries: null,
  });

  useEffect(() => {
    (async () => {
      const keys: TabKey[] = ["leads", "customer_profiles", "credit_applications", "inventory_queries"];
      const results = await Promise.all(keys.map(async (k) => {
        const { count } = await supabase.from(k as any).select("*", { count: "exact", head: true });
        return { k, count: count ?? 0 };
      }));
      const c: any = {};
      results.forEach(({ k, count }) => { c[k] = count; });
      setCounts(c);
    })();
  }, []);

  return (
    <Tabs value={active} onValueChange={(v) => setActive(v as TabKey)}>
      <TabsList className="grid grid-cols-2 sm:grid-cols-4 h-auto">
        {(Object.keys(TAB_CONFIG) as TabKey[]).map((k) => (
          <TabsTrigger key={k} value={k} className="flex items-center gap-2 py-2">
            <span>{TAB_CONFIG[k].label}</span>
            <Badge variant="secondary">{counts[k] == null ? "…" : counts[k]!.toLocaleString()}</Badge>
          </TabsTrigger>
        ))}
      </TabsList>
      {(Object.keys(TAB_CONFIG) as TabKey[]).map((k) => (
        <TabsContent key={k} value={k}>
          <PaginatedPanel
            tableKey={k}
            total={counts[k]}
            onRowClick={(row) => setSelected({ table: k, row })}
          />
        </TabsContent>
      ))}
      <RowDetailSheet
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        table={selected?.table ?? null}
        row={selected?.row ?? null}
      />
    </Tabs>
  );
}

function PaginatedPanel({
  tableKey, total, onRowClick,
}: { tableKey: TabKey; total: number | null; onRowClick: (row: any) => void }) {
  const cfg = TAB_CONFIG[tableKey];
  const [rows, setRows] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fmt = (v: any) => {
    if (v == null) return "—";
    if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v)) return new Date(v).toLocaleString();
    if (typeof v === "object") return JSON.stringify(v).slice(0, 40);
    return String(v);
  };

  const loadPage = useCallback(async (p: number) => {
    setLoading(true);
    const from = p * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data } = await (supabase.from(tableKey as any) as any)
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to);
    const batch = data ?? [];
    setRows((prev) => p === 0 ? batch : [...prev, ...batch]);
    if (batch.length < PAGE_SIZE) setDone(true);
    setLoading(false);
  }, [tableKey]);

  useEffect(() => { setRows([]); setPage(0); setDone(false); loadPage(0); }, [tableKey, loadPage]);

  useEffect(() => {
    if (done || loading) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const next = page + 1;
        setPage(next);
        loadPage(next);
      }
    }, { rootMargin: "200px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [page, loading, done, loadPage]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{cfg.label}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {total == null ? "Loading…" : `${total.toLocaleString()} total • showing ${rows.length.toLocaleString()}`}
          </p>
        </div>
        <Link to={cfg.href} className="text-sm text-primary hover:underline">Open full view →</Link>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              {cfg.columns.map((c) => (
                <th key={c.key} className="py-2 pr-4 font-medium">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loading && (
              <tr><td colSpan={cfg.columns.length} className="py-6 text-center text-muted-foreground">No records yet.</td></tr>
            )}
            {rows.map((row, i) => (
              <tr
                key={row.id ?? i}
                className="border-b border-border/50 cursor-pointer hover:bg-muted/40 transition-colors"
                onClick={() => onRowClick(row)}
              >
                {cfg.columns.map((c) => (
                  <td key={c.key} className="py-2 pr-4">{fmt(row[c.key])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div ref={sentinelRef} className="h-8" />
        {loading && <p className="text-center text-xs text-muted-foreground py-2">Loading more…</p>}
        {done && rows.length > 0 && (
          <p className="text-center text-xs text-muted-foreground py-2">End of results</p>
        )}
      </CardContent>
    </Card>
  );
}



function RowDetailSheet({
  open, onOpenChange, table, row,
}: { open: boolean; onOpenChange: (o: boolean) => void; table: TabKey | null; row: any | null }) {
  const [related, setRelated] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !row || !table) return;
    setRelated({});
    setLoading(true);
    (async () => {
      const email: string | undefined = row.email?.toLowerCase?.();
      const results: Record<string, any[]> = {};

      const fetchBy = async (tbl: string, col: string, val: any, label: string) => {
        if (!val) return;
        const { data } = await (supabase.from(tbl as any) as any)
          .select("*").eq(col, val).order("created_at", { ascending: false }).limit(25);
        if (data && data.length) results[label] = data;
      };

      if (table === "leads" && email) {
        await Promise.all([
          fetchBy("customer_profiles", "email", email, "Customer Profile"),
          fetchBy("credit_applications", "email", email, "Credit Applications"),
          fetchBy("funnel_events", "email", email, "Funnel Events"),
          fetchBy("page_views", "email", email, "Page Views"),
        ]);
      } else if (table === "customer_profiles" && email) {
        await Promise.all([
          fetchBy("leads", "email", email, "Leads"),
          fetchBy("credit_applications", "email", email, "Credit Applications"),
          fetchBy("funnel_events", "email", email, "Funnel Events"),
          fetchBy("login_events", "email", email, "Login Events"),
        ]);
      } else if (table === "credit_applications" && email) {
        await Promise.all([
          fetchBy("customer_profiles", "email", email, "Customer Profile"),
          fetchBy("leads", "email", email, "Leads"),
          fetchBy("sales_jacket_sends", "email", email, "Sales Jackets"),
          fetchBy("deals", "customer_email", email, "Deals"),
        ]);
      } else if (table === "inventory_queries") {
        if (row.ip_address) await fetchBy("page_views", "ip_address", row.ip_address, "Same-IP Page Views");
        if (row.vehicle_id) await fetchBy("inventory_queries", "vehicle_id", row.vehicle_id, "Other Queries for Vehicle");
      }

      setRelated(results);
      setLoading(false);
    })();
  }, [open, table, row]);

  const fmtVal = (v: any) => {
    if (v == null || v === "") return <span className="text-muted-foreground">—</span>;
    if (typeof v === "boolean") return v ? "✓" : "✗";
    if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v)) return new Date(v).toLocaleString();
    if (typeof v === "object") return <pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify(v, null, 2)}</pre>;
    return String(v);
  };

  const title = table ? TAB_CONFIG[table].label : "";
  const entries = row ? Object.entries(row) : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle>{title} — Record Details</SheetTitle>
          <SheetDescription>
            {row?.id ? <span className="font-mono text-xs">{row.id}</span> : "All fields and related records"}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1 mt-4 pr-4">
          <div className="space-y-6">
            <section>
              <h3 className="text-sm font-semibold mb-2 text-primary">All Fields</h3>
              <div className="rounded-lg border border-border divide-y divide-border">
                {entries.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-3 gap-2 px-3 py-2 text-sm">
                    <div className="col-span-1 text-muted-foreground font-medium break-all">{k}</div>
                    <div className="col-span-2 break-all">{fmtVal(v)}</div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold mb-2 text-primary">Related Records</h3>
              {loading && <p className="text-sm text-muted-foreground">Loading related data…</p>}
              {!loading && Object.keys(related).length === 0 && (
                <p className="text-sm text-muted-foreground">No related records found.</p>
              )}
              {!loading && Object.entries(related).map(([label, list]) => (
                <div key={label} className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium">{label}</h4>
                    <Badge variant="secondary">{list.length}</Badge>
                  </div>
                  <div className="rounded-lg border border-border divide-y divide-border">
                    {list.map((r, i) => (
                      <div key={r.id ?? i} className="px-3 py-2 text-xs">
                        <div className="flex justify-between gap-2 mb-1">
                          <span className="font-mono text-muted-foreground truncate">{r.id ?? `#${i + 1}`}</span>
                          <span className="text-muted-foreground">
                            {r.created_at ? new Date(r.created_at).toLocaleString() : ""}
                          </span>
                        </div>
                        <div className="text-foreground/80 break-all">
                          {Object.entries(r)
                            .filter(([k]) => !["id", "created_at", "updated_at"].includes(k))
                            .slice(0, 6)
                            .map(([k, v]) => (
                              <span key={k} className="mr-3">
                                <span className="text-muted-foreground">{k}:</span>{" "}
                                {v == null ? "—" : typeof v === "object" ? JSON.stringify(v).slice(0, 40) : String(v).slice(0, 60)}
                              </span>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

