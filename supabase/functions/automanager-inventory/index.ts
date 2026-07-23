import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const AUTOMANAGER_BASE_URL = 'https://webmanager.automanager.com/api';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check - admin only
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = claimsData.claims.sub;

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Forbidden: admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('AUTOMANAGER_API_KEY');
    const dealerId = Deno.env.get('AUTOMANAGER_DEALER_ID');

    if (!apiKey || !dealerId) {
      console.log('Missing AutoManager credentials - returning demo data');
      return new Response(JSON.stringify({
        success: true,
        vehicles: [],
        message: 'AutoManager credentials not configured. Add AUTOMANAGER_API_KEY and AUTOMANAGER_DEALER_ID secrets.',
        isDemo: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, vehicleId } = await req.json();

    // Validate action allowlist
    const allowedActions = ['list', 'detail', 'sync'];
    if (action && !allowedActions.includes(action)) {
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate vehicleId format when required (prevents path traversal)
    if (action === 'detail') {
      if (typeof vehicleId !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(vehicleId)) {
        return new Response(JSON.stringify({ error: 'Invalid vehicleId' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    console.log(`AutoManager API request: action=${action}, dealerId=${dealerId}`);

    let endpoint = '';
    let method = 'GET';
    const safeDealerId = encodeURIComponent(dealerId);

    switch (action) {
      case 'list':
        endpoint = `/dealers/${safeDealerId}/inventory`;
        break;
      case 'detail':
        endpoint = `/dealers/${safeDealerId}/inventory/${encodeURIComponent(vehicleId)}`;
        break;
      case 'sync':
        endpoint = `/dealers/${safeDealerId}/inventory/sync`;
        method = 'POST';
        break;
      default:
        endpoint = `/dealers/${safeDealerId}/inventory`;
    }

    const response = await fetch(`${AUTOMANAGER_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`AutoManager API error: ${response.status} ${response.statusText}`);
      throw new Error(`AutoManager API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`AutoManager API success: received ${data.vehicles?.length || 0} vehicles`);

    const vehicles = (data.vehicles || data || []).map((v: any) => ({
      id: v.stockNumber || v.id,
      name: `${v.year} ${v.make} ${v.model}`,
      price: v.sellingPrice || v.price || 0,
      image: v.photos?.[0]?.url || v.mainPhoto || '',
      year: v.year,
      mileage: v.mileage?.toLocaleString() || '0',
      fuel: v.fuelType || 'Gasoline',
      badge: determineBadge(v),
      transmission: v.transmission || 'Automatic',
      engine: v.engine || '',
      drivetrain: v.drivetrain || 'FWD',
      mpgCity: v.mpgCity || null,
      mpgHighway: v.mpgHighway || null,
      horsepower: v.horsepower || null,
      seating: v.seating || 5,
      warranty: v.warranty || 'Extended Available',
      vin: v.vin,
      exteriorColor: v.exteriorColor,
      interiorColor: v.interiorColor,
      stockNumber: v.stockNumber,
      description: v.description || '',
      features: v.features || [],
      photos: v.photos || [],
    }));

    return new Response(JSON.stringify({
      success: true,
      vehicles,
      total: vehicles.length,
      isDemo: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in automanager-inventory function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
      vehicles: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function determineBadge(vehicle: any): string {
  const mileage = vehicle.mileage || 0;
  const price = vehicle.sellingPrice || vehicle.price || 0;
  const year = vehicle.year || new Date().getFullYear();
  const currentYear = new Date().getFullYear();

  if (currentYear - year <= 1 && mileage < 20000) return 'Like New';
  if (mileage < 30000) return 'Low Miles';
  if (price < 20000) return 'Great Value';
  if (vehicle.certified) return 'Certified';
  return 'Available';
}
