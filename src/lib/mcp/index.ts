import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchInventoryTool from "./tools/search_inventory";
import getDealershipInfoTool from "./tools/get_dealership_info";
import listRecentLeadsTool from "./tools/list_recent_leads";
import listCreditApplicationsTool from "./tools/list_credit_applications";
import listDealsInPipelineTool from "./tools/list_deals_in_pipeline";

// Import-safe: Vite inlines VITE_SUPABASE_PROJECT_ID at build; falls back for the
// throwaway manifest-extract eval.
const projectRef =
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env
    ?.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "middleman-motors-mcp",
  title: "Middleman Motors",
  version: "0.2.0",
  instructions:
    "Tools for Middleman Motors, a pre-owned car dealership serving Georgia and Virginia.\n\nPublic tools (no auth): `search_inventory`, `get_dealership_info`.\n\nAuthenticated tools (admin/finance staff only): `list_recent_leads`, `list_credit_applications`, `list_deals_in_pipeline`. These return sensitive customer PII — never share externally.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    searchInventoryTool,
    getDealershipInfoTool,
    listRecentLeadsTool,
    listCreditApplicationsTool,
    listDealsInPipelineTool,
  ],
});
