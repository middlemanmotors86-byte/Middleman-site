import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Pencil,
  Trash2,
  FileText,
  Link2,
  Unlink,
  Loader2,
  User,
  Car,
  DollarSign,
  Shield,
  Users,
  CheckCircle2,
  FileDown,
} from "lucide-react";
import { format } from "date-fns";
import { downloadSalesJacket, emailSalesJacket } from "@/lib/salesJacket";
import { Mail } from "lucide-react";
import type { Deal } from "@/pages/admin/Pipeline";

interface DealDetailSheetProps {
  deal: Deal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (deal: Deal) => void;
  onDelete: (dealId: string) => void;
  onStageChange: (deal: Deal) => void;
}

interface LinkedDoc {
  id: string;
  document_type: string | null;
  document_upload_id: string;
  file_name: string;
  mime_type: string;
}

interface AvailableDoc {
  id: string;
  file_name: string;
  mime_type: string;
}

const JACKET_TYPES = [
  "Bill of Sale (T-7)",
  "Title / MV-1",
  "Odometer (T-8)",
  "Buyer's Guide (FTC)",
  "Finance Contract",
  "Tag Receipt (MV-18G)",
  "Driver's License Copy",
  "Proof of Insurance",
  "Vehicle History",
  "Emissions Certificate",
  "Reassignment (T-11)",
  "Power of Attorney (T-8 POA)",
  "Lien Release",
  "TAVT Documentation",
  "Delivery Receipt",
];

const STAGES: { key: Deal["stage"]; label: string }[] = [
  { key: "inquiry", label: "Inquiry" },
  { key: "approved", label: "Approved" },
  { key: "docs_signing", label: "Docs Signing" },
  { key: "sold", label: "Sold" },
];

export function DealDetailSheet({ deal, open, onOpenChange, onEdit, onDelete, onStageChange }: DealDetailSheetProps) {
  const { toast } = useToast();
  const [linkedDocs, setLinkedDocs] = useState<LinkedDoc[]>([]);
  const [availableDocs, setAvailableDocs] = useState<AvailableDoc[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [selectedDocId, setSelectedDocId] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [isLinking, setIsLinking] = useState(false);

  useEffect(() => {
    if (open) fetchDocs();
  }, [open, deal.id]);

  const fetchDocs = async () => {
    setIsLoadingDocs(true);
    try {
      // Fetch linked documents
      const { data: links, error: linksErr } = await supabase
        .from("deal_documents")
        .select("id, document_type, document_upload_id")
        .eq("deal_id", deal.id);
      if (linksErr) throw linksErr;

      // Fetch all document uploads for names
      const { data: allDocs, error: docsErr } = await supabase
        .from("document_uploads")
        .select("id, file_name, mime_type");
      if (docsErr) throw docsErr;

      const docMap = new Map((allDocs || []).map(d => [d.id, d]));
      const linked = (links || []).map(l => ({
        ...l,
        file_name: docMap.get(l.document_upload_id)?.file_name || "Unknown",
        mime_type: docMap.get(l.document_upload_id)?.mime_type || "",
      }));
      setLinkedDocs(linked);

      const linkedIds = new Set((links || []).map(l => l.document_upload_id));
      setAvailableDocs((allDocs || []).filter(d => !linkedIds.has(d.id)));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const linkDocument = async () => {
    if (!selectedDocId) return;
    setIsLinking(true);
    try {
      const { error } = await supabase.from("deal_documents").insert({
        deal_id: deal.id,
        document_upload_id: selectedDocId,
        document_type: selectedType || null,
      });
      if (error) throw error;
      toast({ title: "Document linked" });
      setSelectedDocId("");
      setSelectedType("");
      fetchDocs();
    } catch {
      toast({ title: "Error", description: "Failed to link document", variant: "destructive" });
    } finally {
      setIsLinking(false);
    }
  };

  const unlinkDocument = async (linkId: string) => {
    try {
      const { error } = await supabase.from("deal_documents").delete().eq("id", linkId);
      if (error) throw error;
      toast({ title: "Document unlinked" });
      fetchDocs();
    } catch {
      toast({ title: "Error", description: "Failed to unlink document", variant: "destructive" });
    }
  };

  const handleStageChange = async (newStage: Deal["stage"]) => {
    try {
      const { error } = await supabase
        .from("deals")
        .update({ stage: newStage, updated_at: new Date().toISOString() })
        .eq("id", deal.id);
      if (error) throw error;
      onStageChange({ ...deal, stage: newStage });
      toast({ title: "Stage updated" });
    } catch {
      toast({ title: "Error", description: "Failed to update stage", variant: "destructive" });
    }
  };

  const InfoRow = ({ label, value }: { label: string; value: string | null | undefined }) => {
    if (!value) return null;
    return (
      <div className="flex justify-between py-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-medium text-right max-w-[60%] break-words">{value}</span>
      </div>
    );
  };

  // Sales jacket completion
  const completedTypes = new Set(linkedDocs.map(d => d.document_type).filter(Boolean));
  const jacketProgress = Math.round((completedTypes.size / JACKET_TYPES.length) * 100);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {deal.customer_name}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5 mt-4">
          {/* Stage selector */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Stage:</span>
            <Select value={deal.stage} onValueChange={(v) => handleStageChange(v as Deal["stage"])}>
              <SelectTrigger className="w-40 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAGES.map(s => (
                  <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Customer info */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <User className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Customer</span>
            </div>
            <InfoRow label="Name" value={deal.customer_name} />
            <InfoRow label="Email" value={deal.customer_email} />
            <InfoRow label="Phone" value={deal.customer_phone} />
            <InfoRow label="DL #" value={deal.customer_dl_number} />
            <InfoRow label="Address" value={[deal.customer_address, deal.customer_city, deal.customer_state, deal.customer_zip].filter(Boolean).join(", ")} />
          </div>

          <Separator />

          {/* Vehicle */}
          {(deal.vehicle_make || deal.vehicle_vin) && (
            <>
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Car className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">Vehicle</span>
                </div>
                <InfoRow label="Vehicle" value={[deal.vehicle_year, deal.vehicle_make, deal.vehicle_model].filter(Boolean).join(" ")} />
                <InfoRow label="VIN" value={deal.vehicle_vin} />
                <InfoRow label="Stock #" value={deal.vehicle_stock_number} />
                <InfoRow label="Sale Price" value={deal.sale_price ? `$${Number(deal.sale_price).toLocaleString()}` : null} />
              </div>
              <Separator />
            </>
          )}

          {/* Financial */}
          {(deal.customer_employer || deal.customer_income || deal.insurance_provider) && (
            <>
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">Financial</span>
                </div>
                <InfoRow label="Employer" value={deal.customer_employer} />
                <InfoRow label="Income" value={deal.customer_income ? `$${Number(deal.customer_income).toLocaleString()}/mo` : null} />
                <InfoRow label="Credit Score" value={deal.customer_credit_score?.toString()} />
                <InfoRow label="Insurance" value={deal.insurance_provider} />
                <InfoRow label="Policy #" value={deal.insurance_policy_number} />
              </div>
              <Separator />
            </>
          )}

          {/* Trade-in */}
          {(deal.trade_in_make || deal.trade_in_vin) && (
            <>
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Car className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">Trade-In</span>
                </div>
                <InfoRow label="Vehicle" value={[deal.trade_in_year, deal.trade_in_make, deal.trade_in_model].filter(Boolean).join(" ")} />
                <InfoRow label="VIN" value={deal.trade_in_vin} />
                <InfoRow label="Value" value={deal.trade_in_value ? `$${Number(deal.trade_in_value).toLocaleString()}` : null} />
              </div>
              <Separator />
            </>
          )}

          {/* Co-buyer */}
          {deal.co_buyer_name && (
            <>
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">Co-Buyer</span>
                </div>
                <InfoRow label="Name" value={deal.co_buyer_name} />
                <InfoRow label="Phone" value={deal.co_buyer_phone} />
                <InfoRow label="Email" value={deal.co_buyer_email} />
                <InfoRow label="DL #" value={deal.co_buyer_dl_number} />
              </div>
              <Separator />
            </>
          )}

          {/* Notes */}
          {deal.notes && (
            <>
              <div>
                <span className="text-sm font-semibold">Notes</span>
                <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{deal.notes}</p>
              </div>
              <Separator />
            </>
          )}

          {/* Sales Jacket Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Sales Jacket</span>
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {completedTypes.size}/{JACKET_TYPES.length} ({jacketProgress}%)
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 mb-3">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${jacketProgress}%` }}
              />
            </div>
            <div className="grid grid-cols-1 gap-1">
              {JACKET_TYPES.map(type => {
                const done = completedTypes.has(type);
                return (
                  <div key={type} className="flex items-center gap-2 py-0.5">
                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${done ? "text-green-600" : "text-muted-foreground/30"}`} />
                    <span className={`text-xs ${done ? "text-foreground" : "text-muted-foreground"}`}>{type}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Linked Documents */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Linked Documents</span>
            </div>

            {isLoadingDocs ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : (
              <>
                {linkedDocs.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    {linkedDocs.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-2 rounded-md bg-secondary/50">
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{doc.file_name}</p>
                          {doc.document_type && (
                            <Badge variant="outline" className="text-[10px] mt-0.5">{doc.document_type}</Badge>
                          )}
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => unlinkDocument(doc.id)}>
                          <Unlink className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Link new document */}
                {availableDocs.length > 0 && (
                  <div className="space-y-2 p-3 rounded-md border border-dashed border-border">
                    <p className="text-xs font-medium">Link existing document</p>
                    <Select value={selectedDocId} onValueChange={setSelectedDocId}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select document..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDocs.map(d => (
                          <SelectItem key={d.id} value={d.id} className="text-xs">{d.file_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Document type (optional)..." />
                      </SelectTrigger>
                      <SelectContent>
                        {JACKET_TYPES.map(t => (
                          <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="sm" className="w-full h-7 text-xs" disabled={!selectedDocId || isLinking} onClick={linkDocument}>
                      {isLinking ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Link2 className="w-3 h-3 mr-1" />}
                      Link Document
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          <Separator />

          {/* Sales Jacket Generator */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button
              variant="default"
              onClick={async () => {
                await downloadSalesJacket(deal);
                toast({ title: "Sales jacket generated", description: "PDF download started." });
              }}
            >
              <FileDown className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button
              variant="outline"
              disabled={!deal.customer_email}
              onClick={async () => {
                const res = await emailSalesJacket(deal);
                if (res.ok) {
                  toast({
                    title: "Email draft opened",
                    description: `PDF downloaded — attach it in your mail client to send to ${deal.customer_email}. Send was logged.`,
                  });
                } else {
                  toast({
                    title: "Could not email",
                    description: res.error || "Missing customer email.",
                    variant: "destructive",
                  });
                }
              }}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email to Customer
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onEdit(deal)}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" className="flex-1" onClick={() => onDelete(deal.id)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>

          <p className="text-[10px] text-muted-foreground text-center">
            Created {format(new Date(deal.created_at), "MMM d, yyyy h:mm a")}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
