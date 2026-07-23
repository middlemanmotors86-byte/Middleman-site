import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Phone, Tag } from "lucide-react";
import { format } from "date-fns";

interface Lead {
  id: string;
  created_at: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  source: string;
  program_tags: string[];
  status: string;
  internal_notes: string | null;
}

const STATUS_OPTIONS = ["new", "contacted", "qualified", "converted", "lost"] as const;

export default function AdminLeads() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [open, setOpen] = useState<Lead | null>(null);
  const [notes, setNotes] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) {
      toast({ title: "Failed to load leads", description: error.message, variant: "destructive" });
    } else {
      setLeads((data as Lead[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    leads.forEach((l) => l.program_tags?.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [leads]);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (tagFilter !== "all" && !l.program_tags?.includes(tagFilter)) return false;
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      return true;
    });
  }, [leads, tagFilter, statusFilter]);

  const updateLead = async (id: string, patch: Partial<Lead>) => {
    const { error } = await supabase.from("leads").update(patch).eq("id", id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    if (open?.id === id) setOpen({ ...open, ...patch });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">Leads</h1>
            <p className="text-sm text-muted-foreground">
              CRM lead capture from website forms, inventory inquiries, and marketing campaigns.
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Program tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All program tags</SelectItem>
                {allTags.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{filtered.length} lead(s)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No leads yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((l) => (
                      <TableRow
                        key={l.id}
                        className="cursor-pointer"
                        onClick={() => {
                          setOpen(l);
                          setNotes(l.internal_notes || "");
                        }}
                      >
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {format(new Date(l.created_at), "MMM d, h:mm a")}
                        </TableCell>
                        <TableCell className="font-medium">{l.name}</TableCell>
                        <TableCell className="text-xs">
                          {l.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {l.email}
                            </div>
                          )}
                          {l.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {l.phone}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{l.source}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {l.program_tags?.map((t) => (
                              <Badge key={t} variant="secondary" className="text-xs">
                                <Tag className="h-2.5 w-2.5 mr-1" />
                                {t}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={l.status}
                            onValueChange={(v) => updateLead(l.id, { status: v })}
                          >
                            <SelectTrigger className="w-[130px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {open && (
            <>
              <SheetHeader>
                <SheetTitle>{open.name}</SheetTitle>
                <SheetDescription>
                  {format(new Date(open.created_at), "PPpp")} · {open.source}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Contact</div>
                  <div>{open.email || "—"}</div>
                  <div>{open.phone || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Program tags</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {open.program_tags?.map((t) => (
                      <Badge key={t} variant="secondary">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
                {open.message && (
                  <div>
                    <div className="text-xs text-muted-foreground">Message</div>
                    <p className="whitespace-pre-wrap">{open.message}</p>
                  </div>
                )}
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Internal notes</div>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={5}
                  />
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={() => updateLead(open.id, { internal_notes: notes })}
                  >
                    Save notes
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
}
