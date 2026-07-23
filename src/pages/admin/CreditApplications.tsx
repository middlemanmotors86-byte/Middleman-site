import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Loader2, Search, ChevronRight } from "lucide-react";
import { CreditAppDetailSheet } from "@/components/admin/CreditAppDetailSheet";

export type CreditApplication = {
  id: string;
  status: "new" | "reviewing" | "approved" | "declined" | "needs_info";
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string | null;
  state: string | null;
  monthly_income: number | null;
  vehicle_year: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_stock_number: string | null;
  has_co_applicant: boolean;
  internal_notes: string | null;
  decline_reason: string | null;
  linked_deal_id: string | null;
  soft_pull_status: "not_run" | "requested" | "completed" | "failed";
  soft_pull_score: number | null;
  // full row passed through; everything else optional
  [k: string]: any;
};

const STATUS_LABEL: Record<CreditApplication["status"], string> = {
  new: "New",
  reviewing: "Reviewing",
  approved: "Approved",
  declined: "Declined",
  needs_info: "Needs info",
};

const statusVariant = (s: CreditApplication["status"]): "default" | "secondary" | "destructive" | "outline" => {
  if (s === "approved") return "default";
  if (s === "declined") return "destructive";
  if (s === "new") return "secondary";
  return "outline";
};

export default function AdminCreditApplications() {
  const { toast } = useToast();
  const [apps, setApps] = useState<CreditApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | CreditApplication["status"]>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CreditApplication | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("credit_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error loading applications", description: error.message, variant: "destructive" });
    } else {
      setApps((data as CreditApplication[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = apps.filter((a) => {
    if (filter !== "all" && a.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        `${a.first_name} ${a.last_name}`.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.phone.toLowerCase().includes(q) ||
        (a.vehicle_stock_number || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = apps.reduce(
    (acc, a) => {
      acc[a.status]++;
      acc.all++;
      return acc;
    },
    { all: 0, new: 0, reviewing: 0, approved: 0, declined: 0, needs_info: 0 } as Record<string, number>,
  );

  return (
    <AdminLayout allowFinance>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Credit Applications</h1>
          <p className="text-muted-foreground">CAPS — Credit Application Processing System</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <CardTitle>Inbox</CardTitle>
                <CardDescription>{counts.all} total · {counts.new} new</CardDescription>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Search name, email, phone, stock #"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mt-3">
              <TabsList>
                <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
                <TabsTrigger value="new">New ({counts.new})</TabsTrigger>
                <TabsTrigger value="reviewing">Reviewing ({counts.reviewing})</TabsTrigger>
                <TabsTrigger value="needs_info">Needs info ({counts.needs_info})</TabsTrigger>
                <TabsTrigger value="approved">Approved ({counts.approved})</TabsTrigger>
                <TabsTrigger value="declined">Declined ({counts.declined})</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No applications match.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead className="text-right">Income / mo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((a) => (
                      <TableRow key={a.id} className="cursor-pointer" onClick={() => setSelected(a)}>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(a.created_at), "MMM d, h:mm a")}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{a.first_name} {a.last_name}</div>
                          {a.has_co_applicant && <div className="text-xs text-muted-foreground">+ co-applicant</div>}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{a.email}</div>
                          <div className="text-xs text-muted-foreground">{a.phone}</div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {a.vehicle_year || a.vehicle_make || a.vehicle_model
                            ? `${a.vehicle_year || ""} ${a.vehicle_make || ""} ${a.vehicle_model || ""}`.trim()
                            : <span className="text-muted-foreground">—</span>}
                          {a.vehicle_stock_number && <div className="text-xs text-muted-foreground">#{a.vehicle_stock_number}</div>}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {a.monthly_income ? `$${Number(a.monthly_income).toLocaleString()}` : "—"}
                        </TableCell>
                        <TableCell><Badge variant={statusVariant(a.status)}>{STATUS_LABEL[a.status]}</Badge></TableCell>
                        <TableCell><ChevronRight className="w-4 h-4 text-muted-foreground" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CreditAppDetailSheet
        app={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        onChanged={load}
      />
    </AdminLayout>
  );
}
