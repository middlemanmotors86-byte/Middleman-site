import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import { Loader2, UserPlus, Trash2, Shield, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "finance" | "user";
  created_at: string;
  email?: string;
}

export default function AdminUsers() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .eq("role", "admin")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAdmins(data || []);
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast({
        title: "Error",
        description: "Failed to load admin users.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address.",
        variant: "destructive",
      });
      return;
    }

    setIsAddingAdmin(true);

    try {
      // First, we need to find the user by email
      // Since we can't query auth.users directly, we'll need to handle this differently
      // For now, we'll create an admin invite system
      
      // Check if user exists by trying to sign them up (will fail if exists)
      // This is a workaround - in production you'd use a server function
      
      toast({
        title: "Admin System",
        description: "To add a new admin: Have them sign up at /auth first, then contact support with their email to grant admin access. This ensures security.",
      });
      
      setDialogOpen(false);
      setNewAdminEmail("");
    } catch (error) {
      console.error("Error adding admin:", error);
      toast({
        title: "Error",
        description: "Failed to add admin user.",
        variant: "destructive",
      });
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const handleRemoveAdmin = async (adminRole: UserRole) => {
    // Prevent removing yourself
    if (adminRole.user_id === user?.id) {
      toast({
        title: "Cannot remove yourself",
        description: "You cannot remove your own admin access.",
        variant: "destructive",
      });
      return;
    }

    setDeletingId(adminRole.id);

    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", adminRole.id);

      if (error) throw error;

      setAdmins((prev) => prev.filter((a) => a.id !== adminRole.id));
      toast({
        title: "Admin removed",
        description: "Admin access has been revoked.",
      });
    } catch (error) {
      console.error("Error removing admin:", error);
      toast({
        title: "Error",
        description: "Failed to remove admin access.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Manage Admins</h1>
            <p className="text-muted-foreground">
              View and manage users with admin access to this panel.
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Admin</DialogTitle>
                <DialogDescription>
                  Grant admin access to an existing user.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">How to add an admin:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Have the user sign up at <code className="text-xs bg-background px-1 rounded">/auth</code></li>
                      <li>Note their user ID from the database</li>
                      <li>Add their admin role directly in the database</li>
                    </ol>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">User Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddAdmin} disabled={isAddingAdmin}>
                  {isAddingAdmin ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Admin"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Admin Users</CardTitle>
            <CardDescription>
              {admins.length} user{admins.length !== 1 ? "s" : ""} with admin access
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : admins.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No admin users found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-mono text-sm">
                        {admin.user_id === user?.id ? (
                          <span className="flex items-center gap-2">
                            {admin.user_id.slice(0, 8)}...
                            <Badge variant="secondary">You</Badge>
                          </span>
                        ) : (
                          `${admin.user_id.slice(0, 8)}...`
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className="gap-1">
                          <Shield className="h-3 w-3" />
                          Admin
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(admin.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveAdmin(admin)}
                          disabled={admin.user_id === user?.id || deletingId === admin.id}
                        >
                          {deletingId === admin.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
