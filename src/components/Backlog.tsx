import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileClock } from "lucide-react";

const BacklogPage = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Task Backlog</h1>
          <p className="text-muted-foreground">
            A central place for items needing review, assignment, or future action.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Backlog Items</CardTitle>
            <CardDescription>
              This is a placeholder for future backlog functionality.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center">
            <FileClock className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground">The Backlog is Empty</h3>
            <p className="text-muted-foreground mt-2">Items that require attention will appear here.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default BacklogPage;