import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, FileText, Users, TrendingUp, Database, LayoutGrid } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    contacts: 0,
    unreadContacts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch contact stats
        const { count: totalContacts } = await supabase
          .from("contact_submissions")
          .select("*", { count: "exact", head: true });

        const { count: unreadContacts } = await supabase
          .from("contact_submissions")
          .select("*", { count: "exact", head: true })
          .eq("is_read", false);

        setStats({
          contacts: totalContacts || 0,
          unreadContacts: unreadContacts || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Contacts",
      value: stats.contacts,
      description: "All contact form submissions",
      icon: MessageSquare,
      color: "text-blue-500",
    },
    {
      title: "Unread Messages",
      value: stats.unreadContacts,
      description: "Messages awaiting review",
      icon: FileText,
      color: "text-orange-500",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to the admin dashboard. Manage your dealership from here.
          </p>
        </div>

        {/* Prominent data-access shortcuts */}
        <div className="grid gap-3 sm:grid-cols-2">
          <a
            href="/admin/sql"
            className="group flex items-center gap-4 p-4 rounded-xl border border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 transition-colors"
          >
            <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">SQL Runner</p>
              <p className="text-sm text-muted-foreground">Query every table. Read-only, admin only.</p>
            </div>
          </a>
          <a
            href="/admin/all-data"
            className="group flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted transition-colors"
          >
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
              <LayoutGrid className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">All Data Hub</p>
              <p className="text-sm text-muted-foreground">Live counts + jump into any dataset.</p>
            </div>
          </a>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "..." : stat.value}
                </div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <a
                href="/admin/inventory"
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Manage Inventory</p>
                  <p className="text-sm text-muted-foreground">View and sync vehicles from DMS</p>
                </div>
              </a>
              <a
                href="/admin/contacts"
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                <MessageSquare className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">View Contact Submissions</p>
                  <p className="text-sm text-muted-foreground">Review and respond to inquiries</p>
                </div>
              </a>
              <a
                href="/admin/descriptions"
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                <FileText className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Generate Vehicle Descriptions</p>
                  <p className="text-sm text-muted-foreground">Create AI-powered listings</p>
                </div>
              </a>
              <a
                href="/admin/users"
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                <Users className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium">Manage Admins</p>
                  <p className="text-sm text-muted-foreground">Add or remove admin users</p>
                </div>
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current system health</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">AI Chat Service</span>
                <span className="flex items-center gap-2 text-sm text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Description Generator</span>
                <span className="flex items-center gap-2 text-sm text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Sora Video Generation</span>
                <span className="flex items-center gap-2 text-sm text-yellow-600">
                  <span className="h-2 w-2 rounded-full bg-yellow-500" />
                  Awaiting API Release
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
