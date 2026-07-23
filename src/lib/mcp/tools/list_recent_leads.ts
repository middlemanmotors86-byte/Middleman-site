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
  name: "list_recent_leads",
  title: "List recent Middleman Motors leads",
  description:
    "Return the most recent customer leads. Admin/finance access only. Sensitive customer data — do not share externally.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).default(10).describe("Max leads to return (1-50)."),
    status: z.string().optional().describe("Optional status filter (e.g. 'new', 'contacted')."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, status }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated." }], isError: true };
    }
    const sb = supabaseForUser(ctx.getToken()!);
    let q = sb
      .from("leads")
      .select("id, created_at, name, email, phone, source, program_tags, status, message")
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
      return { content: [{ type: "text", text: "No leads found." }], structuredContent: { leads: [] } };
    }
    const lines = data.map(
      (l) =>
        `• ${l.name ?? "—"} <${l.email ?? "no email"}> · ${l.phone ?? "no phone"} · ${l.source ?? "?"} · ${l.status ?? "new"} · ${new Date(l.created_at).toLocaleDateString()}`,
    );
    return {
      content: [{ type: "text", text: `${data.length} recent leads:\n${lines.join("\n")}` }],
      structuredContent: { leads: data },
    };
  },
});
