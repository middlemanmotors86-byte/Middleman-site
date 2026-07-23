import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import type { Deal } from "@/pages/admin/Pipeline";
import AddressAutocomplete from "@/components/AddressAutocomplete";

interface DealFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal: Deal | null;
  onSaved: () => void;
}

const emptyForm = {
  customer_name: "",
  customer_email: "",
  customer_phone: "",
  customer_address: "",
  customer_city: "",
  customer_state: "GA",
  customer_zip: "",
  customer_dl_number: "",
  customer_employer: "",
  customer_income: "",
  customer_credit_score: "",
  insurance_provider: "",
  insurance_policy_number: "",
  vehicle_vin: "",
  vehicle_year: "",
  vehicle_make: "",
  vehicle_model: "",
  vehicle_stock_number: "",
  sale_price: "",
  trade_in_year: "",
  trade_in_make: "",
  trade_in_model: "",
  trade_in_vin: "",
  trade_in_value: "",
  co_buyer_name: "",
  co_buyer_phone: "",
  co_buyer_email: "",
  co_buyer_dl_number: "",
  notes: "",
};

export function DealFormDialog({ open, onOpenChange, deal, onSaved }: DealFormDialogProps) {
  const { toast } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (deal) {
      setForm({
        customer_name: deal.customer_name || "",
        customer_email: deal.customer_email || "",
        customer_phone: deal.customer_phone || "",
        customer_address: deal.customer_address || "",
        customer_city: deal.customer_city || "",
        customer_state: deal.customer_state || "GA",
        customer_zip: deal.customer_zip || "",
        customer_dl_number: deal.customer_dl_number || "",
        customer_employer: deal.customer_employer || "",
        customer_income: deal.customer_income?.toString() || "",
        customer_credit_score: deal.customer_credit_score?.toString() || "",
        insurance_provider: deal.insurance_provider || "",
        insurance_policy_number: deal.insurance_policy_number || "",
        vehicle_vin: deal.vehicle_vin || "",
        vehicle_year: deal.vehicle_year || "",
        vehicle_make: deal.vehicle_make || "",
        vehicle_model: deal.vehicle_model || "",
        vehicle_stock_number: deal.vehicle_stock_number || "",
        sale_price: deal.sale_price?.toString() || "",
        trade_in_year: deal.trade_in_year || "",
        trade_in_make: deal.trade_in_make || "",
        trade_in_model: deal.trade_in_model || "",
        trade_in_vin: deal.trade_in_vin || "",
        trade_in_value: deal.trade_in_value?.toString() || "",
        co_buyer_name: deal.co_buyer_name || "",
        co_buyer_phone: deal.co_buyer_phone || "",
        co_buyer_email: deal.co_buyer_email || "",
        co_buyer_dl_number: deal.co_buyer_dl_number || "",
        notes: deal.notes || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [deal, open]);

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.customer_name.trim()) {
      toast({ title: "Name required", description: "Enter the customer's name", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        customer_name: form.customer_name.trim(),
        customer_email: form.customer_email || null,
        customer_phone: form.customer_phone || null,
        customer_address: form.customer_address || null,
        customer_city: form.customer_city || null,
        customer_state: form.customer_state || null,
        customer_zip: form.customer_zip || null,
        customer_dl_number: form.customer_dl_number || null,
        customer_employer: form.customer_employer || null,
        customer_income: form.customer_income ? parseFloat(form.customer_income) : null,
        customer_credit_score: form.customer_credit_score ? parseInt(form.customer_credit_score) : null,
        insurance_provider: form.insurance_provider || null,
        insurance_policy_number: form.insurance_policy_number || null,
        vehicle_vin: form.vehicle_vin || null,
        vehicle_year: form.vehicle_year || null,
        vehicle_make: form.vehicle_make || null,
        vehicle_model: form.vehicle_model || null,
        vehicle_stock_number: form.vehicle_stock_number || null,
        sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
        trade_in_year: form.trade_in_year || null,
        trade_in_make: form.trade_in_make || null,
        trade_in_model: form.trade_in_model || null,
        trade_in_vin: form.trade_in_vin || null,
        trade_in_value: form.trade_in_value ? parseFloat(form.trade_in_value) : null,
        co_buyer_name: form.co_buyer_name || null,
        co_buyer_phone: form.co_buyer_phone || null,
        co_buyer_email: form.co_buyer_email || null,
        co_buyer_dl_number: form.co_buyer_dl_number || null,
        notes: form.notes || null,
        updated_at: new Date().toISOString(),
      };

      if (deal) {
        const { error } = await supabase.from("deals").update(payload).eq("id", deal.id);
        if (error) throw error;
        toast({ title: "Deal updated" });
      } else {
        const { error } = await supabase.from("deals").insert(payload);
        if (error) throw error;
        toast({ title: "Deal created" });
      }
      onSaved();
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to save deal", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const Field = ({ label, field, type = "text", placeholder = "" }: { label: string; field: string; type?: string; placeholder?: string }) => (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input
        type={type}
        value={(form as any)[field]}
        onChange={(e) => set(field, e.target.value)}
        placeholder={placeholder}
        className="h-8 text-sm"
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{deal ? "Edit Deal" : "New Deal"}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="customer" className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-8">
            <TabsTrigger value="customer" className="text-xs">Customer</TabsTrigger>
            <TabsTrigger value="vehicle" className="text-xs">Vehicle</TabsTrigger>
            <TabsTrigger value="financial" className="text-xs">Financial</TabsTrigger>
            <TabsTrigger value="tradein" className="text-xs">Trade-In</TabsTrigger>
            <TabsTrigger value="cobuyer" className="text-xs">Co-Buyer</TabsTrigger>
          </TabsList>

          <TabsContent value="customer" className="space-y-3 mt-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full Name *" field="customer_name" placeholder="John Doe" />
              <Field label="Email" field="customer_email" type="email" placeholder="john@example.com" />
              <Field label="Phone" field="customer_phone" type="tel" placeholder="(404) 555-0123" />
              <Field label="Driver's License #" field="customer_dl_number" placeholder="GA DL Number" />
            </div>
            <AddressAutocomplete
              label="Street Address"
              value={form.customer_address}
              onChange={(v) => setForm((f) => ({ ...f, customer_address: v }))}
              onPlaceSelected={(p) =>
                setForm((f) => ({
                  ...f,
                  customer_address: p.street || p.fullAddress,
                  customer_city: p.city || f.customer_city,
                  customer_state: p.state || f.customer_state,
                  customer_zip: p.zip || f.customer_zip,
                }))
              }
              placeholder="123 Main St"
            />
            <div className="grid grid-cols-3 gap-3">
              <Field label="City" field="customer_city" placeholder="Atlanta" />
              <Field label="State" field="customer_state" placeholder="GA" />
              <Field label="ZIP" field="customer_zip" placeholder="30301" />
            </div>
          </TabsContent>

          <TabsContent value="vehicle" className="space-y-3 mt-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Year" field="vehicle_year" placeholder="2020" />
              <Field label="Make" field="vehicle_make" placeholder="Toyota" />
              <Field label="Model" field="vehicle_model" placeholder="Camry" />
              <Field label="Stock #" field="vehicle_stock_number" placeholder="STK-001" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="VIN" field="vehicle_vin" placeholder="17-character VIN" />
              <Field label="Sale Price" field="sale_price" type="number" placeholder="15000" />
            </div>
          </TabsContent>

          <TabsContent value="financial" className="space-y-3 mt-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Employer" field="customer_employer" placeholder="Company name" />
              <Field label="Monthly Income" field="customer_income" type="number" placeholder="4000" />
              <Field label="Credit Score" field="customer_credit_score" type="number" placeholder="680" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Insurance Provider" field="insurance_provider" placeholder="State Farm" />
              <Field label="Policy Number" field="insurance_policy_number" placeholder="Policy #" />
            </div>
          </TabsContent>

          <TabsContent value="tradein" className="space-y-3 mt-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Year" field="trade_in_year" placeholder="2015" />
              <Field label="Make" field="trade_in_make" placeholder="Honda" />
              <Field label="Model" field="trade_in_model" placeholder="Civic" />
              <Field label="VIN" field="trade_in_vin" placeholder="Trade-in VIN" />
            </div>
            <Field label="Estimated Value" field="trade_in_value" type="number" placeholder="5000" />
          </TabsContent>

          <TabsContent value="cobuyer" className="space-y-3 mt-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Co-Buyer Name" field="co_buyer_name" placeholder="Jane Doe" />
              <Field label="Phone" field="co_buyer_phone" type="tel" placeholder="(404) 555-0456" />
              <Field label="Email" field="co_buyer_email" type="email" placeholder="jane@example.com" />
              <Field label="Driver's License #" field="co_buyer_dl_number" placeholder="GA DL Number" />
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-1 mt-2">
          <Label className="text-xs">Notes</Label>
          <Textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Internal notes about this deal..."
            className="text-sm"
            rows={2}
          />
        </div>

        <Button onClick={handleSave} disabled={isSaving} className="w-full mt-2">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {deal ? "Update Deal" : "Create Deal"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
