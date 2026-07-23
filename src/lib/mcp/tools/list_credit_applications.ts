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
  name: "list_credit_applications",
  title: "List Middleman Motors credit applications",
  description:
    "Return recent credit applications. Admin/finance access only. Sensitive PII — do not share externally. Redacts SSN and DL numbers.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).default(10).describe("Max applications to return (1-50)."),
    status: z
      .string()
      .optional()
      .describe("Optional status filter (e.g. 'pending', 'approved', 'declined')."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, status }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated." }], isError: true };
    }
    const sb = supabaseForUser(ctx.getToken()!);
    let q = sb
      .from("credit_applications")
      .select("id, created_at, status, channel, first_name, last_name, email, phone, city, state, housing_status, housing_payment")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (status) q = q.eq("status", status);
    const { data, error } = await q;
    if (error) {
      return {
        content: [{ type: "text", text: `Query failed: ${error.message}` }],
        isError: true,
      };
    }
    if (!data || data.length === 0) {
      return {
        content: [{ type: "text", text: "No credit applications found." }],
        structuredContent: { applications: [] },
      };
    }
    const lines = data.map(
      (a) =>
        `• ${a.first_name ?? ""} ${a.last_name ?? ""} <${a.email ?? "no email"}> · ${a.city ?? "?"}, ${a.state ?? "?"} · ${a.status ?? "pending"} · ${new Date(a.created_at).toLocaleDateString()}`,
    );
    return {
      content: [{ type: "text", text: `${data.length} credit applications:\n${lines.join("\n")}` }],
      structuredContent: { applications: data },
    };
  },
});
