// Public endpoint for customers to submit a credit application.
// Uses service role to bypass RLS, validates input with Zod, and rate-limits by IP.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const Schema = z.object({
  // Personal
  first_name: z.string().trim().min(1).max(80),
  last_name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(7).max(30),
  date_of_birth: z.string().optional().nullable(),
  ssn_last_four: z.string().regex(/^\d{4}$/).optional().nullable(),
  dl_number: z.string().max(40).optional().nullable(),
  dl_state: z.string().max(2).optional().nullable(),
  marital_status: z.string().max(20).optional().nullable(),
  dependents: z.number().int().min(0).max(20).optional().nullable(),

  // Residence
  address: z.string().max(200).optional().nullable(),
  address_2: z.string().max(100).optional().nullable(),
  city: z.string().max(80).optional().nullable(),
  state: z.string().max(2).optional().nullable(),
  zip: z.string().max(10).optional().nullable(),
  housing_status: z.string().max(20).optional().nullable(),
  housing_payment: z.number().min(0).max(100000).optional().nullable(),
  years_at_address: z.number().int().min(0).max(99).optional().nullable(),
  months_at_address: z.number().int().min(0).max(11).optional().nullable(),
  previous_address: z.string().max(300).optional().nullable(),

  // Employment
  employment_status: z.string().max(30).optional().nullable(),
  employer_name: z.string().max(120).optional().nullable(),
  employer_phone: z.string().max(30).optional().nullable(),
  job_title: z.string().max(100).optional().nullable(),
  monthly_income: z.number().min(0).max(1000000).optional().nullable(),
  years_at_employer: z.number().int().min(0).max(99).optional().nullable(),
  months_at_employer: z.number().int().min(0).max(11).optional().nullable(),
  other_income: z.number().min(0).max(1000000).optional().nullable(),
  other_income_source: z.string().max(200).optional().nullable(),

  // Co-applicant
  has_co_applicant: z.boolean().default(false),
  co_first_name: z.string().max(80).optional().nullable(),
  co_last_name: z.string().max(80).optional().nullable(),
  co_email: z.string().email().max(255).optional().nullable().or(z.literal("")),
  co_phone: z.string().max(30).optional().nullable(),
  co_ssn_last_four: z.string().regex(/^\d{4}$/).optional().nullable().or(z.literal("")),
  co_relationship: z.string().max(40).optional().nullable(),
  co_monthly_income: z.number().min(0).max(1000000).optional().nullable(),

  // References
  reference_1_name: z.string().max(120).optional().nullable(),
  reference_1_phone: z.string().max(30).optional().nullable(),
  reference_1_relationship: z.string().max(40).optional().nullable(),
  reference_2_name: z.string().max(120).optional().nullable(),
  reference_2_phone: z.string().max(30).optional().nullable(),
  reference_2_relationship: z.string().max(40).optional().nullable(),

  // Vehicle of interest
  vehicle_stock_number: z.string().max(40).optional().nullable(),
  vehicle_year: z.string().max(4).optional().nullable(),
  vehicle_make: z.string().max(40).optional().nullable(),
  vehicle_model: z.string().max(60).optional().nullable(),
  vehicle_vin: z.string().max(20).optional().nullable(),
  desired_down_payment: z.number().min(0).max(1000000).optional().nullable(),
  desired_monthly_payment: z.number().min(0).max(100000).optional().nullable(),
  trade_in_details: z.string().max(500).optional().nullable(),

  // Consent
  consent_credit_check: z.literal(true),
  consent_terms: z.literal(true),
  signature_name: z.string().trim().min(2).max(120),

  // Anti-spam (client-side honeypot + timing)
  website: z.string().max(200).optional().nullable(),
  form_started_at: z.number().optional().nullable(),
});


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Rate limit: max 3 submissions per IP per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("rate_limit_tracking")
      .select("id", { count: "exact", head: true })
      .eq("identifier", ip)
      .eq("action", "credit_app_submit")
      .gte("created_at", oneHourAgo);

    if ((count ?? 0) >= 3) {
      return new Response(
        JSON.stringify({ error: "Too many submissions. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid form data", details: parsed.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = parsed.data;

    // Honeypot: real users leave `website` empty. Bots fill every field.
    // Also require at least 3s between form load and submission.
    const tooFast =
      typeof data.form_started_at === "number" &&
      Date.now() - data.form_started_at < 3000;
    if ((data.website && data.website.trim().length > 0) || tooFast) {
      console.warn("Spam blocked", { ip, website: !!data.website, tooFast });
      // Silent success so bots don't retry with variations.
      return new Response(JSON.stringify({ success: true, id: "spam-blocked" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Strip anti-spam fields before insert (columns don't exist on the table).
    const { website: _hp, form_started_at: _fs, ...cleanData } = data;

    const insertRow = {
      ...cleanData,
      // Normalize empty optional emails to null
      co_email: cleanData.co_email || null,
      co_ssn_last_four: cleanData.co_ssn_last_four || null,
      submitted_ip: ip,
      submitted_user_agent: userAgent,
      signed_at: new Date().toISOString(),
      signature_ip: ip,
      status: "new" as const,
      channel: "web",
    };


    const { data: inserted, error } = await supabase
      .from("credit_applications")
      .insert(insertRow)
      .select("id")
      .single();

    if (error) {
      console.error("Insert error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to save application" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    await supabase
      .from("rate_limit_tracking")
      .insert({ identifier: ip, action: "credit_app_submit" });

    // Archive the raw request payload to the private credit-app-requests bucket.
    // Uses the service role, so RLS on storage.objects is bypassed intentionally
    // for this server-side archival step.
    try {
      const archive = {
        id: inserted.id,
        submitted_at: insertRow.signed_at,
        ip,
        user_agent: userAgent,
        payload: cleanData,
      };
      const key = `${new Date().toISOString().slice(0, 10)}/${inserted.id}.json`;
      const { error: upErr } = await supabase.storage
        .from("credit-app-requests")
        .upload(key, new Blob([JSON.stringify(archive, null, 2)], { type: "application/json" }), {
          contentType: "application/json",
          upsert: false,
        });
      if (upErr) console.error("credit-app-requests archive failed:", upErr);
    } catch (archiveErr) {
      console.error("credit-app-requests archive threw:", archiveErr);
    }

    return new Response(JSON.stringify({ success: true, id: inserted.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("submit-credit-app error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
