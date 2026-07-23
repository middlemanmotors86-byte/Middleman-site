import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Loader2, GripVertical, ChevronRight, Car, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { DealFormDialog } from "@/components/admin/DealFormDialog";
import { DealDetailSheet } from "@/components/admin/DealDetailSheet";

export interface Deal {
  id: string;
  created_at: string;
  updated_at: string;
  stage: "inquiry" | "approved" | "docs_signing" | "sold";
  vehicle_vin: string | null;
  vehicle_year: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_stock_number: string | null;
  sale_price: number | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  customer_city: string | null;
  customer_state: string | null;
  customer_zip: string | null;
  customer_dl_number: string | null;
  customer_employer: string | null;
  customer_income: number | null;
  customer_credit_score: number | null;
  insurance_provider: string | null;
  insurance_policy_number: string | null;
  trade_in_year: string | null;
  trade_in_make: string | null;
  trade_in_model: string | null;
  trade_in_vin: string | null;
  trade_in_value: number | null;
  co_buyer_name: string | null;
  co_buyer_phone: string | null;
  co_buyer_email: string | null;
  co_buyer_dl_number: string | null;
  notes: string | null;
}

const STAGES: { key: Deal["stage"]; label: string; color: string }[] = [
  { key: "inquiry", label: "Inquiry", color: "bg-blue-500/10 text-blue-700 border-blue-300" },
  { key: "approved", label: "Approved", color: "bg-amber-500/10 text-amber-700 border-amber-300" },
  { key: "docs_signing", label: "Docs Signing", color: "bg-purple-500/10 text-purple-700 border-purple-300" },
  { key: "sold", label: "Sold", color: "bg-green-500/10 text-green-700 border-green-300" },
];

const AdminPipeline = () => {
  const { toast } = useToast();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [detailDeal, setDetailDeal] = useState<Deal | null>(null);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const { data, error } = await supabase
        .from("deals")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setDeals((data as Deal[]) || []);
    } catch (error) {
      console.error("Error fetching deals:", error);
      toast({ title: "Error", description: "Failed to load deals", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const moveStage = async (deal: Deal, direction: "next" | "prev") => {
    const stageOrder: Deal["stage"][] = ["inquiry", "approved", "docs_signing", "sold"];
    const idx = stageOrder.indexOf(deal.stage);
    const newIdx = direction === "next" ? idx + 1 : idx - 1;
    if (newIdx < 0 || newIdx >= stageOrder.length) return;

    const newStage = stageOrder[newIdx];
    try {
      const { error } = await supabase
        .from("deals")
        .update({ stage: newStage, updated_at: new Date().toISOString() })
        .eq("id", deal.id);
      if (error) throw error;
      setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, stage: newStage } : d));
      toast({ title: "Deal moved", description: `Moved to ${STAGES.find(s => s.key === newStage)?.label}` });
    } catch {
      toast({ title: "Error", description: "Failed to move deal", variant: "destructive" });
    }
  };

  const handleSaved = () => {
    setFormOpen(false);
    setEditingDeal(null);
    fetchDeals();
  };

  const handleDelete = async (dealId: string) => {
    try {
      const { error } = await supabase.from("deals").delete().eq("id", dealId);
      if (error) throw error;
      setDeals(prev => prev.filter(d => d.id !== dealId));
      setDetailDeal(null);
      toast({ title: "Deal deleted" });
    } catch {
      toast({ title: "Error", description: "Failed to delete deal", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Sales Pipeline</h1>
            <p className="text-muted-foreground">
              {deals.length} active deal{deals.length !== 1 ? "s" : ""} · Georgia Sales Jacket flow
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href="/admin/pipeline/new">
                <Sparkles className="w-4 h-4 mr-2" />
                New Intake
              </a>
            </Button>
            <Button onClick={() => { setEditingDeal(null); setFormOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              New Deal
            </Button>
          </div>
        </div>

        {/* Pipeline columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {STAGES.map((stage) => {
            const stageDeals = deals.filter(d => d.stage === stage.key);
            return (
              <div key={stage.key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={stage.color}>
                    {stage.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-medium">
                    {stageDeals.length}
                  </span>
                </div>
                <div className="space-y-2 min-h-[200px]">
                  {stageDeals.map((deal) => (
                    <Card
                      key={deal.id}
                      className="cursor-pointer hover:shadow-md transition-shadow border-border/60"
                      onClick={() => setDetailDeal(deal)}
                    >
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-sm leading-tight">
                            {deal.customer_name}
                          </p>
                          <GripVertical className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                        </div>
                        {(deal.vehicle_year || deal.vehicle_make) && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Car className="w-3 h-3" />
                            <span>
                              {[deal.vehicle_year, deal.vehicle_make, deal.vehicle_model]
                                .filter(Boolean)
                                .join(" ")}
                            </span>
                          </div>
                        )}
                        {deal.sale_price && (
                          <p className="text-xs font-medium text-primary">
                            ${Number(deal.sale_price).toLocaleString()}
                          </p>
                        )}
                        <p className="text-[11px] text-muted-foreground">
                          {format(new Date(deal.created_at), "MMM d, yyyy")}
                        </p>
                        {/* Stage movement buttons */}
                        <div className="flex gap-1 pt-1">
                          {stage.key !== "inquiry" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-[10px]"
                              onClick={(e) => { e.stopPropagation(); moveStage(deal, "prev"); }}
                            >
                              ← Back
                            </Button>
                          )}
                          {stage.key !== "sold" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-[10px] ml-auto"
                              onClick={(e) => { e.stopPropagation(); moveStage(deal, "next"); }}
                            >
                              Next →
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {stageDeals.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                      No deals
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <DealFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        deal={editingDeal}
        onSaved={handleSaved}
      />

      {detailDeal && (
        <DealDetailSheet
          deal={detailDeal}
          open={!!detailDeal}
          onOpenChange={(open) => { if (!open) setDetailDeal(null); }}
          onEdit={(deal) => { setDetailDeal(null); setEditingDeal(deal); setFormOpen(true); }}
          onDelete={handleDelete}
          onStageChange={(deal) => {
            setDeals(prev => prev.map(d => d.id === deal.id ? deal : d));
            setDetailDeal(deal);
          }}
        />
      )}
    </AdminLayout>
  );
};

export default AdminPipeline;
