import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

function supabaseForUser(token: string) {
  const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {};
  const url = env.SUPABASE_URL!;
  const anon = env.SUPABASE_PUBLISHABLE_KEY ?? env.SUPABASE_ANON_KEY ?? "";
  return createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_deals_in_pipeline",
  title: "List deals in the sales pipeline",
  description:
    "Return active deals from the sales pipeline. Admin/finance access only. Shows stage, vehicle, customer, and sale price.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).default(10).describe("Max deals to return (1-50)."),
    stage: z
      .string()
      .optional()
      .describe("Optional pipeline stage filter (e.g. 'new', 'financing', 'closed')."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, stage }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated." }], isError: true };
    }
    const sb = supabaseForUser(ctx.getToken()!);
    let q = sb
      .from("deals")
      .select(
        "id, created_at, stage, vehicle_year, vehicle_make, vehicle_model, vehicle_stock_number, sale_price, customer_name, customer_email, customer_phone",
      )
      .order("created_at", { ascending: false })
      .limit(limit);
    if (stage) q = q.eq("stage", stage);
    const { data, error } = await q;
    if (error) {
      return {
        content: [{ type: "text", text: `Query failed: ${error.message}` }],
        isError: true,
      };
    }
    if (!data || data.length === 0) {
      return { content: [{ type: "text", text: "No deals found." }], structuredContent: { deals: [] } };
    }
    const lines = data.map(
      (d) =>
        `• [${d.stage ?? "?"}] ${d.vehicle_year ?? ""} ${d.vehicle_make ?? ""} ${d.vehicle_model ?? ""} (Stock #${d.vehicle_stock_number ?? "?"}) — ${d.customer_name ?? "?"} — $${Number(d.sale_price ?? 0).toLocaleString()}`,
    );
    return {
      content: [{ type: "text", text: `${data.length} deals:\n${lines.join("\n")}` }],
      structuredContent: { deals: data },
    };
  },
});
