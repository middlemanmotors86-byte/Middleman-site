import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import {
  UserPlus, ClipboardList, Activity as ActivityIcon, Megaphone, UserCog,
  FileText, BarChart3, CheckCircle2, Circle, Plus, RefreshCw,
} from "lucide-react";

type Stat = { label: string; value: number | string; icon: any; href?: string };

export default function AdminCRM() {
  const { user } = useAuth();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  const [leads, setLeads] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [jackets, setJackets] = useState<any[]>([]);
  const [traffic, setTraffic] = useState<any[]>([]);

  const loadAll = async () => {
    setLoading(true);
    const [l, t, a, c, p, j, pv] = await Promise.all([
      supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("crm_tasks").select("*").order("due_at", { ascending: true }).limit(100),
      supabase.from("crm_activities").select("*").order("occurred_at", { ascending: false }).limit(100),
      supabase.from("marketing_campaigns").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("customer_profiles").select("*").order("updated_at", { ascending: false }).limit(100),
      supabase.from("sales_jacket_sends").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("page_views").select("path,created_at,ip,referrer").order("created_at", { ascending: false }).limit(100),
    ]);
    setLeads(l.data ?? []);
    setTasks(t.data ?? []);
    setActivities(a.data ?? []);
    setCampaigns(c.data ?? []);
    setProfiles(p.data ?? []);
    setJackets(j.data ?? []);
    setTraffic(pv.data ?? []);

    const openTasks = (t.data ?? []).filter((x) => x.status === "open" || x.status === "in_progress").length;
    const newLeads = (l.data ?? []).filter((x) => new Date(x.created_at) > new Date(Date.now() - 7 * 864e5)).length;

    setStats([
      { label: "Leads (7d)", value: newLeads, icon: UserPlus },
      { label: "Open tasks", value: openTasks, icon: ClipboardList },
      { label: "Activities logged", value: (a.data ?? []).length, icon: ActivityIcon },
      { label: "Campaigns", value: (c.data ?? []).length, icon: Megaphone },
      { label: "Customer profiles", value: (p.data ?? []).length, icon: UserCog },
      { label: "Sales jackets sent", value: (j.data ?? []).length, icon: FileText },
    ]);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">CRM Hub</h1>
            <p className="text-muted-foreground">Leads, tasks, activities, campaigns and all downstream data.</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadAll} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <s.icon className="w-4 h-4" /> {s.label}
                </div>
                <div className="text-2xl font-bold mt-1">{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="overview"><BarChart3 className="w-4 h-4 mr-1" />Overview</TabsTrigger>
            <TabsTrigger value="leads"><UserPlus className="w-4 h-4 mr-1" />Leads</TabsTrigger>
            <TabsTrigger value="tasks"><ClipboardList className="w-4 h-4 mr-1" />Tasks</TabsTrigger>
            <TabsTrigger value="activities"><ActivityIcon className="w-4 h-4 mr-1" />Activities</TabsTrigger>
            <TabsTrigger value="campaigns"><Megaphone className="w-4 h-4 mr-1" />Campaigns</TabsTrigger>
            <TabsTrigger value="profiles"><UserCog className="w-4 h-4 mr-1" />Profiles</TabsTrigger>
            <TabsTrigger value="jackets"><FileText className="w-4 h-4 mr-1" />Sales Jackets</TabsTrigger>
            <TabsTrigger value="traffic"><BarChart3 className="w-4 h-4 mr-1" />Traffic</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="grid md:grid-cols-2 gap-4 mt-4">
            <Card>
              <CardHeader><CardTitle>Latest leads</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {leads.slice(0, 6).map((l) => (
                  <div key={l.id} className="flex justify-between text-sm border-b pb-1">
                    <div>
                      <div className="font-medium">{l.name || l.email}</div>
                      <div className="text-xs text-muted-foreground">{l.source}</div>
                    </div>
                    <Badge variant="secondary">{l.status ?? "new"}</Badge>
                  </div>
                ))}
                {leads.length === 0 && <p className="text-sm text-muted-foreground">No leads yet.</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Upcoming tasks</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {tasks.filter((t) => t.status !== "done").slice(0, 6).map((t) => (
                  <div key={t.id} className="flex justify-between text-sm border-b pb-1">
                    <div>
                      <div className="font-medium">{t.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {t.due_at ? format(new Date(t.due_at), "MMM d, p") : "No due date"}
                      </div>
                    </div>
                    <Badge variant={t.priority === "high" || t.priority === "urgent" ? "destructive" : "outline"}>
                      {t.priority}
                    </Badge>
                  </div>
                ))}
                {tasks.length === 0 && <p className="text-sm text-muted-foreground">No tasks.</p>}
              </CardContent>
            </Card>
          </TabsContent>

          {/* LEADS */}
          <TabsContent value="leads" className="mt-4">
            <Card>
              <CardHeader><CardTitle>Leads ({leads.length})</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground border-b">
                    <tr><th className="p-2">Name</th><th className="p-2">Email</th><th className="p-2">Source</th><th className="p-2">Tags</th><th className="p-2">Status</th><th className="p-2">Created</th></tr>
                  </thead>
                  <tbody>
                    {leads.map((l) => (
                      <tr key={l.id} className="border-b hover:bg-muted/40">
                        <td className="p-2">{l.name}</td>
                        <td className="p-2">{l.email}</td>
                        <td className="p-2">{l.source}</td>
                        <td className="p-2">{(l.program_tags ?? []).join(", ")}</td>
                        <td className="p-2"><Badge variant="secondary">{l.status ?? "new"}</Badge></td>
                        <td className="p-2 text-xs">{format(new Date(l.created_at), "MMM d, p")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TASKS */}
          <TabsContent value="tasks" className="mt-4 space-y-4">
            <TaskComposer onCreated={loadAll} userId={user?.id} />
            <Card>
              <CardHeader><CardTitle>All tasks</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {tasks.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 border-b pb-2">
                    <button
                      onClick={async () => {
                        const done = t.status === "done";
                        await supabase.from("crm_tasks").update({
                          status: done ? "open" : "done",
                          completed_at: done ? null : new Date().toISOString(),
                        }).eq("id", t.id);
                        loadAll();
                      }}
                    >
                      {t.status === "done" ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
                    </button>
                    <div className="flex-1">
                      <div className={`font-medium ${t.status === "done" ? "line-through text-muted-foreground" : ""}`}>{t.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {t.contact_email} · Due {t.due_at ? format(new Date(t.due_at), "MMM d, p") : "—"}
                      </div>
                    </div>
                    <Badge variant={t.priority === "high" || t.priority === "urgent" ? "destructive" : "outline"}>{t.priority}</Badge>
                  </div>
                ))}
                {tasks.length === 0 && <p className="text-sm text-muted-foreground">No tasks yet.</p>}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ACTIVITIES */}
          <TabsContent value="activities" className="mt-4 space-y-4">
            <ActivityComposer onCreated={loadAll} userId={user?.id} />
            <Card>
              <CardHeader><CardTitle>Activity log</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {activities.map((a) => (
                  <div key={a.id} className="border-b pb-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{a.subject || a.activity_type}</span>
                      <span className="text-xs text-muted-foreground">{format(new Date(a.occurred_at), "MMM d, p")}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <Badge variant="outline" className="mr-1">{a.activity_type}</Badge>
                      {a.contact_email}
                    </div>
                    {a.body && <p className="text-sm mt-1">{a.body}</p>}
                  </div>
                ))}
                {activities.length === 0 && <p className="text-sm text-muted-foreground">No activity yet.</p>}
              </CardContent>
            </Card>
          </TabsContent>

          {/* CAMPAIGNS */}
          <TabsContent value="campaigns" className="mt-4 space-y-4">
            <CampaignComposer onCreated={loadAll} userId={user?.id} />
            <Card>
              <CardHeader><CardTitle>Campaigns</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground border-b">
                    <tr><th className="p-2">Name</th><th className="p-2">Channel</th><th className="p-2">Status</th><th className="p-2">Scheduled</th><th className="p-2">Created</th></tr>
                  </thead>
                  <tbody>
                    {campaigns.map((c) => (
                      <tr key={c.id} className="border-b hover:bg-muted/40">
                        <td className="p-2 font-medium">{c.name}</td>
                        <td className="p-2">{c.channel}</td>
                        <td className="p-2"><Badge variant="secondary">{c.status}</Badge></td>
                        <td className="p-2 text-xs">{c.scheduled_at ? format(new Date(c.scheduled_at), "MMM d, p") : "—"}</td>
                        <td className="p-2 text-xs">{format(new Date(c.created_at), "MMM d")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {campaigns.length === 0 && <p className="text-sm text-muted-foreground p-2">No campaigns yet.</p>}
              </CardContent>
            </Card>
          </TabsContent>

          {/* PROFILES */}
          <TabsContent value="profiles" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer profiles ({profiles.length})</CardTitle>
                <CardDescription>Auto-created from every lead and credit application.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground border-b">
                    <tr><th className="p-2">Name</th><th className="p-2">Email</th><th className="p-2">Phone</th><th className="p-2">Leads</th><th className="p-2">Credit apps</th><th className="p-2">First source</th></tr>
                  </thead>
                  <tbody>
                    {profiles.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-muted/40">
                        <td className="p-2">{p.full_name}</td>
                        <td className="p-2">{p.email}</td>
                        <td className="p-2">{p.phone}</td>
                        <td className="p-2">{p.lead_count}</td>
                        <td className="p-2">{p.credit_app_count}</td>
                        <td className="p-2 text-xs">{p.first_source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SALES JACKETS */}
          <TabsContent value="jackets" className="mt-4">
            <Card>
              <CardHeader><CardTitle>Sales jackets sent ({jackets.length})</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground border-b">
                    <tr><th className="p-2">Sent to</th><th className="p-2">Email</th><th className="p-2">File</th><th className="p-2">Status</th><th className="p-2">Sent</th></tr>
                  </thead>
                  <tbody>
                    {jackets.map((j) => (
                      <tr key={j.id} className="border-b hover:bg-muted/40">
                        <td className="p-2">{j.sent_to_name}</td>
                        <td className="p-2">{j.sent_to_email}</td>
                        <td className="p-2 text-xs">{j.file_name}</td>
                        <td className="p-2"><Badge variant={j.status === "sent" ? "secondary" : "destructive"}>{j.status}</Badge></td>
                        <td className="p-2 text-xs">{format(new Date(j.created_at), "MMM d, p")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {jackets.length === 0 && <p className="text-sm text-muted-foreground p-2">No jackets sent yet.</p>}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TRAFFIC */}
          <TabsContent value="traffic" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent page views ({traffic.length})</CardTitle>
                <CardDescription>Cold traffic and returning visitors. Full analytics at /admin/analytics.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground border-b">
                    <tr><th className="p-2">Path</th><th className="p-2">Referrer</th><th className="p-2">IP</th><th className="p-2">When</th></tr>
                  </thead>
                  <tbody>
                    {traffic.map((v, i) => (
                      <tr key={i} className="border-b hover:bg-muted/40">
                        <td className="p-2 font-mono text-xs">{v.path}</td>
                        <td className="p-2 text-xs truncate max-w-[240px]">{v.referrer || "—"}</td>
                        <td className="p-2 text-xs">{v.ip}</td>
                        <td className="p-2 text-xs">{format(new Date(v.created_at), "MMM d, p")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

/* ---------- inline composers ---------- */

function TaskComposer({ onCreated, userId }: { onCreated: () => void; userId?: string }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", contact_email: "", due_at: "", priority: "normal", description: "" });
  const save = async () => {
    if (!form.title) return toast.error("Title required");
    const { error } = await supabase.from("crm_tasks").insert({
      title: form.title,
      contact_email: form.contact_email || null,
      due_at: form.due_at || null,
      priority: form.priority,
      description: form.description || null,
      created_by: userId,
    });
    if (error) return toast.error(error.message);
    toast.success("Task created");
    setForm({ title: "", contact_email: "", due_at: "", priority: "normal", description: "" });
    setOpen(false);
    onCreated();
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-1" />New task</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New task</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input placeholder="Contact email (optional)" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
          <Input type="datetime-local" value={form.due_at} onChange={(e) => setForm({ ...form, due_at: e.target.value })} />
          <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
          <Textarea placeholder="Notes" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ActivityComposer({ onCreated, userId }: { onCreated: () => void; userId?: string }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ activity_type: "call", contact_email: "", subject: "", body: "", direction: "outbound" });
  const save = async () => {
    const { error } = await supabase.from("crm_activities").insert({
      activity_type: form.activity_type,
      contact_email: form.contact_email || null,
      subject: form.subject || null,
      body: form.body || null,
      direction: form.direction,
      actor_id: userId,
    });
    if (error) return toast.error(error.message);
    toast.success("Activity logged");
    setForm({ activity_type: "call", contact_email: "", subject: "", body: "", direction: "outbound" });
    setOpen(false);
    onCreated();
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-1" />Log activity</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Log activity</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Select value={form.activity_type} onValueChange={(v) => setForm({ ...form, activity_type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="call">Call</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="note">Note</SelectItem>
            </SelectContent>
          </Select>
          <Select value={form.direction} onValueChange={(v) => setForm({ ...form, direction: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="outbound">Outbound</SelectItem>
              <SelectItem value="inbound">Inbound</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Contact email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
          <Input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <Textarea placeholder="Notes" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        </div>
        <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CampaignComposer({ onCreated, userId }: { onCreated: () => void; userId?: string }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", channel: "email", subject: "", body: "", scheduled_at: "" });
  const save = async () => {
    if (!form.name || !form.body) return toast.error("Name and body required");
    const { error } = await supabase.from("marketing_campaigns").insert({
      name: form.name,
      channel: form.channel,
      subject: form.subject || null,
      body: form.body,
      scheduled_at: form.scheduled_at || null,
      status: form.scheduled_at ? "scheduled" : "draft",
      created_by: userId,
    });
    if (error) return toast.error(error.message);
    toast.success("Campaign created");
    setForm({ name: "", channel: "email", subject: "", body: "", scheduled_at: "" });
    setOpen(false);
    onCreated();
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-1" />New campaign</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New campaign</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Select value={form.channel} onValueChange={(v) => setForm({ ...form, channel: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Subject (email only)" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <Textarea placeholder="Body / template" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={6} />
          <Input type="datetime-local" placeholder="Schedule (optional)" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} />
        </div>
        <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
