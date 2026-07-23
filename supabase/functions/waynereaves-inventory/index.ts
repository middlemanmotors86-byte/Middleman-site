import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Use native Deno.serve instead of std/http/server.ts
Deno.serve(async (req) => {
  // CORS preflight handling
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Fetch environment variables
    const supabaseUrl = Deno.env.get('VITE_SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('VITE_SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('VITE_SUPABASE_API_KEY');

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      throw new Error("Supabase environment variables are not set.");
    }

    // 2. Fetch normalized inventory from waynereaves-inventory function
    const inventoryResponse = await fetch(`${supabaseUrl}/functions/v1/waynereaves-inventory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ action: 'list' }),
    });

    if (!inventoryResponse.ok) {
      const errorText = await inventoryResponse.text();
      throw new Error(`Failed to fetch Wayne Reaves feed: ${errorText}`);
    }

    const { vehicles } = await inventoryResponse.json();

    if (!vehicles || vehicles.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No vehicles found to sync." }), 
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Upsert normalized vehicles using Admin Service Role client (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await supabaseAdmin
      .from('vehicles')
      .upsert(vehicles, { onConflict: 'vin', ignoreDuplicates: false });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true, count: vehicles.length }), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Sync inventory error:", error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});