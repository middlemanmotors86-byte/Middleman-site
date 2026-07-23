import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const INFO = {
  name: "Middleman Motors",
  tagline: "Quality pre-owned vehicles with transparent pricing",
  website: "https://www.middlemanmotors.com",
  service_area: ["Georgia", "Virginia"],
  certifications: ["Minority-Owned Business", "African American-Owned Business", "GIADA Member"],
  services: [
    "Pre-owned vehicle sales",
    "150-point vehicle inspection",
    "Financing & credit applications",
    "Government & fleet contracting",
    "Vehicle comparison tool",
  ],
  policies: {
    inspection: "Every vehicle undergoes a 150-point inspection before sale.",
    pre_qualifying_fee:
      "A non-refundable fee of $100 is required to obtain a soft credit report for evaluating eligibility for vehicle purchase and financing. This does not impact your credit score.",
  },
  pages: {
    inventory: "https://www.middlemanmotors.com/inventory",
    apply: "https://www.middlemanmotors.com/apply",
    government: "https://www.middlemanmotors.com/government-contracting",
    partners: "https://www.middlemanmotors.com/partners",
  },
};

export default defineTool({
  name: "get_dealership_info",
  title: "Get Middleman Motors dealership info",
  description:
    "Return general information about Middleman Motors: services, service area, certifications, inspection policy, and key page URLs.",
  inputSchema: {
    section: z
      .enum(["all", "services", "policies", "pages", "certifications"])
      .default("all")
      .describe("Which section of the dealership info to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ section }) => {
    const data =
      section === "all"
        ? INFO
        : section === "services"
        ? { services: INFO.services }
        : section === "policies"
        ? { policies: INFO.policies }
        : section === "pages"
        ? { pages: INFO.pages }
        : { certifications: INFO.certifications };

    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: data,
    };
  },
});
