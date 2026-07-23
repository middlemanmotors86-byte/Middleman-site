import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search } from "lucide-react";

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  first_source: string | null;
  first_utm_source: string | null;
  last_utm_source: string | null;
  lead_count: number;
  credit_app_count: number;
  created_at: string;
  updated_at: string;
};

export default function AdminCustomerProfiles() {
  const [rows, setRows] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("customer_profiles")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(500);
      setRows((data as Profile[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = q.trim()
    ? rows.filter((r) =>
        [r.email, r.full_name, r.phone, r.city, r.state]
          .filter(Boolean)
          .some((v) => (v as string).toLowerCase().includes(q.toLowerCase())),
      )
    : rows;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Customer Profiles</h1>
          <p className="text-muted-foreground">Auto-created from leads &amp; credit applications. One row per email.</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{filtered.length} profiles</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input className="pl-8" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="py-2 px-2">Email</th>
                      <th className="py-2 px-2">Name</th>
                      <th className="py-2 px-2">Phone</th>
                      <th className="py-2 px-2">Location</th>
                      <th className="py-2 px-2">First Source</th>
                      <th className="py-2 px-2">Last UTM</th>
                      <th className="py-2 px-2">Leads</th>
                      <th className="py-2 px-2">Credit</th>
                      <th className="py-2 px-2">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-2 px-2 font-medium">{r.email}</td>
                        <td className="py-2 px-2">{r.full_name ?? "—"}</td>
                        <td className="py-2 px-2">{r.phone ?? "—"}</td>
                        <td className="py-2 px-2">{[r.city, r.state].filter(Boolean).join(", ") || "—"}</td>
                        <td className="py-2 px-2">{r.first_source ?? "—"}</td>
                        <td className="py-2 px-2">{r.last_utm_source ?? "—"}</td>
                        <td className="py-2 px-2 text-primary">{r.lead_count}</td>
                        <td className="py-2 px-2 text-primary">{r.credit_app_count}</td>
                        <td className="py-2 px-2 text-muted-foreground">{new Date(r.updated_at).toLocaleDateString()}</td>
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
