import { supabase } from "@/integrations/supabase/client";

/**
 * Archive an approval decision document for a credit application to the private
 * `credit-app-approvals` bucket. Admin-only (enforced by storage RLS).
 */
export async function archiveCreditApproval(params: {
  applicationId: string;
  decision: "approved" | "declined" | "needs_info";
  approvedAmount?: number;
  apr?: number;
  termMonths?: number;
  lender?: string;
  notes?: string;
  decidedBy?: string;
}): Promise<{ path: string } | { error: string }> {
  const doc = {
    application_id: params.applicationId,
    decision: params.decision,
    approved_amount: params.approvedAmount ?? null,
    apr: params.apr ?? null,
    term_months: params.termMonths ?? null,
    lender: params.lender ?? null,
    notes: params.notes ?? null,
    decided_by: params.decidedBy ?? null,
    decided_at: new Date().toISOString(),
  };
  const key = `${new Date().toISOString().slice(0, 10)}/${params.applicationId}-${params.decision}.json`;
  const { error } = await supabase.storage
    .from("credit-app-approvals")
    .upload(key, new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" }), {
      contentType: "application/json",
      upsert: true,
    });
  if (error) return { error: error.message };
  return { path: key };
}

/** Admin-only: get a short-lived signed URL for an approval or request archive object. */
export async function getCreditArchiveSignedUrl(
  bucket: "credit-app-requests" | "credit-app-approvals",
  path: string,
  expiresInSeconds = 900,
): Promise<{ url: string } | { error: string }> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSeconds);
  if (error) return { error: error.message };
  return { url: data.signedUrl };
}
