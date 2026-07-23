import { ReactNode, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Car,
  LogOut,
  Loader2,
  Users,
  ArrowLeft,
  FolderOpen,
  GitPullRequest,
  CreditCard,
  UserPlus,
  Briefcase,
  BarChart3,
  Activity,
  UserCog,
  Plug,
  Search,
  Archive,
  Database,
  Contact,
  Zap,
} from "lucide-react";


import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
  /** When true, finance-role users are also allowed (e.g. credit-application pages). */
  allowFinance?: boolean;
}

const navItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard, financeOk: false },
  { title: "CRM Hub", href: "/admin/crm", icon: Contact, financeOk: false },
  { title: "All Data", href: "/admin/all-data", icon: Database, financeOk: false },
  { title: "Archive Viewer", href: "/admin/archives", icon: Archive, financeOk: true },
  { title: "QuickQualify SOP", href: "/admin/quickqualify-sop", icon: Zap, financeOk: false },
  { title: "Traffic Analytics", href: "/admin/analytics", icon: BarChart3, financeOk: false },
  { title: "Activity Tracking", href: "/admin/tracking", icon: Activity, financeOk: false },
  { title: "Customer Profiles", href: "/admin/customer-profiles", icon: UserCog, financeOk: false },
  { title: "Integrations", href: "/admin/integrations", icon: Plug, financeOk: false },
  { title: "Sales Pipeline", href: "/admin/pipeline", icon: GitPullRequest, financeOk: false },
  { title: "Leads", href: "/admin/leads", icon: UserPlus, financeOk: false },
  { title: "Credit Applications", href: "/admin/credit-applications", icon: CreditCard, financeOk: true },
  { title: "Inventory", href: "/admin/inventory", icon: Car, financeOk: false },
  { title: "Inventory Lookup", href: "/admin/inventory-lookup", icon: Search, financeOk: false },
  { title: "Contact Submissions", href: "/admin/contacts", icon: MessageSquare, financeOk: false },
  { title: "Documents", href: "/admin/documents", icon: FolderOpen, financeOk: false },
  { title: "Description Generator", href: "/admin/descriptions", icon: FileText, financeOk: false },
  { title: "Portfolio Buyers", href: "/admin/portfolio-buyers", icon: Briefcase, financeOk: false },
  { title: "Manage Admins", href: "/admin/users", icon: Users, financeOk: false },
];

export function AdminLayout({ children, allowFinance = false }: AdminLayoutProps) {
  const { user, isAdmin, isFinance, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const hasAccess = isAdmin || (allowFinance && isFinance);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [isLoading, user, navigate]);

  useEffect(() => {
    if (!isLoading && user && !hasAccess) {
      navigate("/auth");
    }
  }, [isLoading, user, hasAccess, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !hasAccess) {
    return null;
  }

  // Finance-only users see only the credit applications nav item
  const visibleNav = isAdmin ? navItems : navItems.filter((i) => i.financeOk);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {visibleNav.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Website
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
