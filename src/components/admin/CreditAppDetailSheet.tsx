import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, Phone, Link as LinkIcon, FileSearch, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import type { CreditApplication } from "@/pages/admin/CreditApplications";

interface Props {
  app: CreditApplication | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onChanged: () => void;
}

const STATUSES: CreditApplication["status"][] = ["new", "reviewing", "needs_info", "approved", "declined"];

export function CreditAppDetailSheet({ app, open, onOpenChange, onChanged }: Props) {
  const { toast } = useToast();
  const [status, setStatus] = useState<CreditApplication["status"]>("new");
  const [notes, setNotes] = useState("");
  const [declineReason, setDeclineReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [linking, setLinking] = useState(false);
  const [pulling, setPulling] = useState(false);

  useEffect(() => {
    if (app) {
      setStatus(app.status);
      setNotes(app.internal_notes || "");
      setDeclineReason(app.decline_reason || "");
    }
  }, [app]);

  if (!app) return null;

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("credit_applications")
      .update({
        status,
        internal_notes: notes || null,
        decline_reason: status === "declined" ? declineReason || null : null,
      })
      .eq("id", app.id);
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }

    // Archive an approval/decision document when a decision is recorded.
    if (status === "approved" || status === "declined" || status === "needs_info") {
      try {
        const { archiveCreditApproval } = await import("@/lib/creditArchive");
        const result = await archiveCreditApproval({
          applicationId: app.id,
          decision: status,
          notes: notes || undefined,
        });
        if ("error" in result) console.warn("Approval archive failed:", result.error);
      } catch (e) {
        console.warn("Approval archive threw:", e);
      }
    }

    toast({ title: "Updated" });
    onChanged();
  };

  const linkToNewDeal = async () => {
    setLinking(true);
    try {
      const { data: deal, error } = await supabase
        .from("deals")
        .insert({
          customer_name: `${app.first_name} ${app.last_name}`,
          customer_email: app.email,
          customer_phone: app.phone,
          customer_address: app.address,
          customer_city: app.city,
          customer_state: app.state,
          customer_zip: app.zip,
          customer_dl_number: app.dl_number,
          customer_employer: app.employer_name,
          customer_income: app.monthly_income,
          vehicle_year: app.vehicle_year,
          vehicle_make: app.vehicle_make,
          vehicle_model: app.vehicle_model,
          vehicle_vin: app.vehicle_vin,
          vehicle_stock_number: app.vehicle_stock_number,
          co_buyer_name: app.has_co_applicant ? `${app.co_first_name || ""} ${app.co_last_name || ""}`.trim() : null,
          co_buyer_email: app.co_email,
          co_buyer_phone: app.co_phone,
          notes: `Auto-created from credit application ${app.id}`,
          stage: "inquiry",
        })
        .select("id")
        .single();
      if (error) throw error;
      await supabase
        .from("credit_applications")
        .update({ linked_deal_id: deal.id })
        .eq("id", app.id);
      toast({ title: "Deal created", description: "Customer added to the sales pipeline." });
      onChanged();
    } catch (e: any) {
      toast({ title: "Link failed", description: e.message, variant: "destructive" });
    } finally {
      setLinking(false);
    }
  };

  const requestSoftPull = async () => {
    setPulling(true);
    const { error } = await supabase
      .from("credit_applications")
      .update({
        soft_pull_status: "requested",
        soft_pull_requested_at: new Date().toISOString(),
      })
      .eq("id", app.id);
    setPulling(false);
    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Soft pull requested",
        description: "Run the pull in iSoftPull's portal, then update the result here.",
      });
      onChanged();
    }
  };

  const Field = ({ label, value }: { label: string; value: any }) => (
    <div>
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className="text-sm">{value || <span className="text-muted-foreground">—</span>}</div>
    </div>
  );

  const fmtMoney = (n: any) => (n != null ? `$${Number(n).toLocaleString()}` : null);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{app.first_name} {app.last_name}</SheetTitle>
          <SheetDescription>
            Submitted {format(new Date(app.created_at), "PPp")} · {app.channel || "web"}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Quick actions */}
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <a href={`mailto:${app.email}`}><Mail className="w-4 h-4 mr-1" /> Email</a>
            </Button>
            <Button asChild size="sm" variant="outline">
              <a href={`tel:${app.phone}`}><Phone className="w-4 h-4 mr-1" /> Call</a>
            </Button>
            {app.linked_deal_id ? (
              <Badge variant="secondary" className="self-center"><LinkIcon className="w-3 h-3 mr-1" /> Linked to deal</Badge>
            ) : (
              <Button size="sm" variant="outline" onClick={linkToNewDeal} disabled={linking}>
                {linking ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <LinkIcon className="w-4 h-4 mr-1" />}
                Create deal in pipeline
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={requestSoftPull} disabled={pulling || app.soft_pull_status === "requested"}>
              {pulling ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <FileSearch className="w-4 h-4 mr-1" />}
              {app.soft_pull_status === "requested" ? "Soft pull requested" : "Request soft credit pull"}
            </Button>
            <Button asChild size="sm" variant="outline">
              <a href="https://isoftpull.com" target="_blank" rel="noreferrer"><ExternalLink className="w-4 h-4 mr-1" /> iSoftPull</a>
            </Button>
          </div>

          {/* Status workflow */}
          <div className="rounded-lg border p-4 space-y-3 bg-muted/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {status === "declined" && (
                <div>
                  <Label className="text-xs">Decline reason</Label>
                  <Textarea rows={2} value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} />
                </div>
              )}
            </div>
            <div>
              <Label className="text-xs">Internal notes</Label>
              <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Visible to staff only" />
            </div>
            <Button onClick={save} disabled={saving} size="sm">
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Save changes
            </Button>
          </div>

          {/* Personal */}
          <Section title="Personal">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Email" value={app.email} />
              <Field label="Phone" value={app.phone} />
              <Field label="DOB" value={app.date_of_birth} />
              <Field label="SSN (last 4)" value={app.ssn_last_four ? `••••${app.ssn_last_four}` : null} />
              <Field label="DL #" value={app.dl_number ? `${app.dl_state || ""} ${app.dl_number}` : null} />
              <Field label="Marital status" value={app.marital_status} />
              <Field label="Dependents" value={app.dependents} />
            </div>
          </Section>

          {/* Residence */}
          <Section title="Residence">
            <Field label="Address" value={[app.address, app.address_2, app.city, app.state, app.zip].filter(Boolean).join(", ")} />
            <div className="grid grid-cols-2 gap-3 mt-2">
              <Field label="Housing" value={app.housing_status} />
              <Field label="Payment" value={fmtMoney(app.housing_payment)} />
              <Field label="Time at address" value={app.years_at_address != null ? `${app.years_at_address}y ${app.months_at_address || 0}m` : null} />
              <Field label="Previous address" value={app.previous_address} />
            </div>
          </Section>

          {/* Employment */}
          <Section title="Employment">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Status" value={app.employment_status} />
              <Field label="Employer" value={app.employer_name} />
              <Field label="Job title" value={app.job_title} />
              <Field label="Employer phone" value={app.employer_phone} />
              <Field label="Monthly income" value={fmtMoney(app.monthly_income)} />
              <Field label="Time at job" value={app.years_at_employer != null ? `${app.years_at_employer}y ${app.months_at_employer || 0}m` : null} />
              <Field label="Other income" value={fmtMoney(app.other_income)} />
              <Field label="Other income source" value={app.other_income_source} />
            </div>
          </Section>

          {/* Co-applicant */}
          {app.has_co_applicant && (
            <Section title="Co-Applicant">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Name" value={`${app.co_first_name || ""} ${app.co_last_name || ""}`.trim()} />
                <Field label="Relationship" value={app.co_relationship} />
                <Field label="Email" value={app.co_email} />
                <Field label="Phone" value={app.co_phone} />
                <Field label="SSN (last 4)" value={app.co_ssn_last_four ? `••••${app.co_ssn_last_four}` : null} />
                <Field label="Monthly income" value={fmtMoney(app.co_monthly_income)} />
              </div>
            </Section>
          )}

          {/* References */}
          <Section title="References">
            {[1, 2].map((n) => (
              <div key={n} className="grid grid-cols-3 gap-3 mb-2">
                <Field label={`Ref ${n} name`} value={app[`reference_${n}_name`]} />
                <Field label="Phone" value={app[`reference_${n}_phone`]} />
                <Field label="Relationship" value={app[`reference_${n}_relationship`]} />
              </div>
            ))}
          </Section>

          {/* Vehicle */}
          <Section title="Vehicle of Interest">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Stock #" value={app.vehicle_stock_number} />
              <Field label="VIN" value={app.vehicle_vin} />
              <Field label="Year" value={app.vehicle_year} />
              <Field label="Make / Model" value={`${app.vehicle_make || ""} ${app.vehicle_model || ""}`.trim()} />
              <Field label="Desired down" value={fmtMoney(app.desired_down_payment)} />
              <Field label="Desired monthly" value={fmtMoney(app.desired_monthly_payment)} />
            </div>
            <Field label="Trade-in" value={app.trade_in_details} />
          </Section>

          {/* Soft pull */}
          <Section title="Soft Credit Pull">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Status" value={app.soft_pull_status} />
              <Field label="Score" value={app.soft_pull_score} />
              <Field label="Requested" value={app.soft_pull_requested_at ? format(new Date(app.soft_pull_requested_at), "PPp") : null} />
              <Field label="Completed" value={app.soft_pull_completed_at ? format(new Date(app.soft_pull_completed_at), "PPp") : null} />
            </div>
          </Section>

          {/* Consent */}
          <Section title="Consent & Signature">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Credit-check consent" value={app.consent_credit_check ? "Yes" : "No"} />
              <Field label="Terms consent" value={app.consent_terms ? "Yes" : "No"} />
              <Field label="Signed" value={app.signature_name} />
              <Field label="Signed at" value={app.signed_at ? format(new Date(app.signed_at), "PPp") : null} />
              <Field label="IP" value={app.signature_ip} />
            </div>
          </Section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">{title}</h3>
      <Separator className="mb-3" />
      <div className="space-y-2">{children}</div>
    </div>
  );
}
