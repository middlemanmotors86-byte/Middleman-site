import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

type Vehicle = {
  id?: string;
  name?: string;
  year?: number;
  make?: string;
  model?: string;
  price?: number;
  mileage?: number | string;
  fuel?: string;
  transmission?: string;
  exteriorColor?: string;
  vin?: string;
  stockNumber?: string;
  image?: string;
};

function matches(v: Vehicle, q: string): boolean {
  if (!q) return true;
  const hay = [
    v.name,
    v.make,
    v.model,
    v.year?.toString(),
    v.exteriorColor,
    v.fuel,
    v.transmission,
    v.vin,
    v.stockNumber,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((tok) => hay.includes(tok));
}

export default defineTool({
  name: "search_inventory",
  title: "Search Middleman Motors inventory",
  description:
    "Search Middleman Motors' current pre-owned vehicle inventory by make, model, year, or keywords. Returns matching vehicles with price, mileage, and stock number.",
  inputSchema: {
    query: z
      .string()
      .describe("Search terms, e.g. 'Toyota Camry', '2020 SUV', 'red truck'. Empty returns all.")
      .default(""),
    max_price: z
      .number()
      .describe("Optional maximum price in USD.")
      .optional(),
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .default(10)
      .describe("Max results to return (1-50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ query, max_price, limit }) => {
    const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {};
    const supabaseUrl = env.SUPABASE_URL!;
    const anonKey = env.SUPABASE_PUBLISHABLE_KEY ?? env.SUPABASE_ANON_KEY ?? "";
    const res = await fetch(`${supabaseUrl}/functions/v1/waynereaves-inventory`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(anonKey ? { Authorization: `Bearer ${anonKey}`, apikey: anonKey } : {}),
      },
      body: JSON.stringify({ action: "list" }),
    });
    if (!res.ok) {
      const text = await res.text();
      return {
        content: [{ type: "text", text: `Inventory feed error (${res.status}): ${text}` }],
        isError: true,
      };
    }
    const data = (await res.json()) as { vehicles?: Vehicle[] };
    const all = data.vehicles ?? [];
    const filtered = all
      .filter((v) => matches(v, query ?? ""))
      .filter((v) => (max_price ? Number(v.price ?? 0) <= max_price : true))
      .slice(0, limit);

    if (filtered.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No vehicles match "${query}"${max_price ? ` under $${max_price}` : ""}. Total in inventory: ${all.length}.`,
          },
        ],
        structuredContent: { total: all.length, results: [] },
      };
    }

    const lines = filtered.map(
      (v) =>
        `• ${v.name ?? `${v.year ?? ""} ${v.make ?? ""} ${v.model ?? ""}`.trim()} — $${Number(v.price ?? 0).toLocaleString()} — ${v.mileage ?? "?"} mi — Stock #${v.stockNumber ?? "?"}`,
    );

    return {
      content: [
        {
          type: "text",
          text: `Found ${filtered.length} of ${all.length} vehicles:\n${lines.join("\n")}\n\nView the full lot at https://www.middlemanmotors.com/inventory`,
        },
      ],
      structuredContent: { total: all.length, count: filtered.length, results: filtered },
    };
  },
});
