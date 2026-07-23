import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { getCreditArchiveSignedUrl } from "@/lib/creditArchive";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Loader2, ExternalLink, RefreshCw, Search } from "lucide-react";
import { format } from "date-fns";

type Bucket = "credit-app-requests" | "credit-app-approvals";

interface ObjRow {
  name: string;
  path: string;
  size?: number | null;
  updated_at?: string | null;
}

export default function ArchiveViewer() {
  const [bucket, setBucket] = useState<Bucket>("credit-app-approvals");
  const [rows, setRows] = useState<ObjRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      // List top-level date folders, then list files inside each.
      const { data: folders, error: fErr } = await supabase.storage
        .from(bucket)
        .list("", { limit: 100, sortBy: { column: "name", order: "desc" } });
      if (fErr) throw fErr;

      const collected: ObjRow[] = [];
      for (const f of folders ?? []) {
        // Folder entries have id === null on Supabase Storage
        if ((f as any).id) {
          collected.push({ name: f.name, path: f.name, size: (f as any).metadata?.size, updated_at: f.updated_at });
          continue;
        }
        const { data: files } = await supabase.storage
          .from(bucket)
          .list(f.name, { limit: 200, sortBy: { column: "name", order: "desc" } });
        for (const file of files ?? []) {
          collected.push({
            name: file.name,
            path: `${f.name}/${file.name}`,
            size: (file as any).metadata?.size,
            updated_at: file.updated_at,
          });
        }
      }
      setRows(collected);
    } catch (e: any) {
      toast({ title: "Load failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bucket]);

  const openFile = async (path: string) => {
    const res = await getCreditArchiveSignedUrl(bucket, path, 900);
    if ("error" in res) {
      toast({ title: "Could not open", description: res.error, variant: "destructive" });
      return;
    }
    window.open(res.url, "_blank", "noopener,noreferrer");
  };

  const filtered = rows.filter((r) => r.path.toLowerCase().includes(query.toLowerCase()));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Archive Viewer</h1>
            <p className="text-muted-foreground">Credit application requests and approval decisions.</p>
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <Tabs value={bucket} onValueChange={(v) => setBucket(v as Bucket)}>
          <TabsList>
            <TabsTrigger value="credit-app-approvals">Approvals</TabsTrigger>
            <TabsTrigger value="credit-app-requests">Requests</TabsTrigger>
          </TabsList>

          <TabsContent value={bucket} className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  <span>{bucket}</span>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-2 top-2.5 text-muted-foreground" />
                    <Input
                      className="pl-8 w-64"
                      placeholder="Search by path"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : filtered.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">No archived files.</p>
                ) : (
                  <div className="divide-y">
                    {filtered.map((r) => (
                      <div key={r.path} className="flex items-center justify-between py-2">
                        <div className="min-w-0">
                          <div className="font-mono text-sm truncate">{r.path}</div>
                          <div className="text-xs text-muted-foreground">
                            {r.updated_at ? format(new Date(r.updated_at), "MMM d, yyyy h:mm a") : "—"}
                            {r.size ? ` • ${(r.size / 1024).toFixed(1)} KB` : ""}
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => openFile(r.path)}>
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Open
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
