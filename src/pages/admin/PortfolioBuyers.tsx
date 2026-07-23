import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, ExternalLink, Loader2, Pencil, Plus, Trash2 } from "lucide-react";

interface Buyer {
  id: string;
  created_at: string;
  company_name: string;
  website: string | null;
  buyer_type: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  terms_summary: string | null;
  status: string;
  last_contacted_at: string | null;
  notes: string | null;
}

const empty: Omit<Buyer, "id" | "created_at"> = {
  company_name: "",
  website: "",
  buyer_type: "",
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  terms_summary: "",
  status: "prospect",
  last_contacted_at: null,
  notes: "",
};

const STATUS = ["prospect", "active", "paused", "inactive"] as const;
const TYPES = [
  "BHPH portfolio",
  "Sub-prime",
  "Lease",
  "Charge-off",
  "Performing notes",
  "Other",
];

export default function AdminPortfolioBuyers() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [editing, setEditing] = useState<Buyer | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("portfolio_buyers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Failed to load", description: error.message, variant: "destructive" });
    } else {
      setBuyers((data as Buyer[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const startNew = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const startEdit = (b: Buyer) => {
    setEditing(b);
    setForm({
      company_name: b.company_name,
      website: b.website || "",
      buyer_type: b.buyer_type || "",
      contact_name: b.contact_name || "",
      contact_email: b.contact_email || "",
      contact_phone: b.contact_phone || "",
      terms_summary: b.terms_summary || "",
      status: b.status,
      last_contacted_at: b.last_contacted_at,
      notes: b.notes || "",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.company_name.trim()) {
      toast({ title: "Company name is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      company_name: form.company_name.trim(),
      website: form.website?.trim() || null,
      buyer_type: form.buyer_type?.trim() || null,
      contact_name: form.contact_name?.trim() || null,
      contact_email: form.contact_email?.trim() || null,
      contact_phone: form.contact_phone?.trim() || null,
      terms_summary: form.terms_summary?.trim() || null,
      status: form.status,
      last_contacted_at: form.last_contacted_at || null,
      notes: form.notes?.trim() || null,
    };
    const { error } = editing
      ? await supabase.from("portfolio_buyers").update(payload).eq("id", editing.id)
      : await supabase.from("portfolio_buyers").insert(payload);
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: editing ? "Buyer updated" : "Buyer added" });
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this portfolio buyer?")) return;
    const { error } = await supabase.from("portfolio_buyers").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    setBuyers((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Briefcase className="h-7 w-7" /> Portfolio Buyers
            </h1>
            <p className="text-sm text-muted-foreground">
              Admin-only directory of portfolio-buying providers (Agora.com, sub-prime buyers, etc.).
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={startNew}>
                <Plus className="mr-2 h-4 w-4" /> Add buyer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit buyer" : "Add portfolio buyer"}</DialogTitle>
                <DialogDescription>
                  Track companies that purchase loan portfolios from the dealership.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                <div className="md:col-span-2">
                  <Label>Company name *</Label>
                  <Input
                    value={form.company_name}
                    onChange={(e) => setForm((p) => ({ ...p, company_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input
                    value={form.website || ""}
                    placeholder="https://agora.com"
                    onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Buyer type</Label>
                  <Select
                    value={form.buyer_type || ""}
                    onValueChange={(v) => setForm((p) => ({ ...p, buyer_type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Contact name</Label>
                  <Input
                    value={form.contact_name || ""}
                    onChange={(e) => setForm((p) => ({ ...p, contact_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Contact email</Label>
                  <Input
                    type="email"
                    value={form.contact_email || ""}
                    onChange={(e) => setForm((p) => ({ ...p, contact_email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Contact phone</Label>
                  <Input
                    type="tel"
                    value={form.contact_phone || ""}
                    onChange={(e) => setForm((p) => ({ ...p, contact_phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label>Last contacted</Label>
                  <Input
                    type="date"
                    value={form.last_contacted_at || ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, last_contacted_at: e.target.value || null }))
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Terms summary</Label>
                  <Textarea
                    value={form.terms_summary || ""}
                    rows={2}
                    placeholder="e.g. 70% advance on performing BHPH paper, 90-day recourse"
                    onChange={(e) => setForm((p) => ({ ...p, terms_summary: e.target.value }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Internal notes</Label>
                  <Textarea
                    value={form.notes || ""}
                    rows={3}
                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={save} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editing ? "Save changes" : "Add buyer"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{buyers.length} buyer(s)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin" />
              </div>
            ) : buyers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No portfolio buyers yet. Add Agora or any other provider to get started.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last contacted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {buyers.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell>
                          <div className="font-medium">{b.company_name}</div>
                          {b.website && (
                            <a
                              href={b.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary inline-flex items-center gap-1 hover:underline"
                            >
                              {b.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </TableCell>
                        <TableCell className="text-xs">{b.buyer_type || "—"}</TableCell>
                        <TableCell className="text-xs">
                          <div>{b.contact_name || "—"}</div>
                          <div className="text-muted-foreground">{b.contact_email}</div>
                          <div className="text-muted-foreground">{b.contact_phone}</div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={b.status === "active" ? "default" : "secondary"}
                            className="capitalize"
                          >
                            {b.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {b.last_contacted_at || "—"}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button size="sm" variant="ghost" onClick={() => startEdit(b)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => remove(b.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
