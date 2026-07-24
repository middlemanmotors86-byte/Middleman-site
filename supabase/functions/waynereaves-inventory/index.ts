import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { XMLParser } from "https://esm.sh/fast-xml-parser@4.3.6";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { normalizeInventoryRow, normalizeVehicle, toArray, type InventoryCacheRow } from "./lib.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

// Wayne Reaves public inventory export endpoints. The dealer ID controls which lot is returned.
const WR_XML_FEED = (dealerId: string) =>
  `https://www.waynereaves.com/InventoryExport.aspx?DealerID=${encodeURIComponent(dealerId)}&Format=XML`;
const WR_XML_FEED_ALT = (dealerId: string) =>
  `https://wreav.es/InventoryExport.aspx?DealerID=${encodeURIComponent(dealerId)}&Format=XML`;
const FALLBACK_JSON_URL = 'https://middlemanmotors.com/inventory-fallback.json';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function getSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('VITE_SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_SECRET');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('VITE_SUPABASE_PUBLISHABLE_KEY');

  if (!supabaseUrl) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey || anonKey || '', {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function fetchInventoryRowsFromFeed(dealerId: string) {
  const username = Deno.env.get('WAYNEREAVES_USERNAME');
  const password = Deno.env.get('WAYNEREAVES_PASSWORD');
  const requestHeaders: Record<string, string> = {
    'Accept': 'application/xml,text/xml,*/*',
    'User-Agent': 'MiddlemanMotors/1.0',
  };
  if (username && password) {
    requestHeaders.Authorization = `Basic ${btoa(`${username}:${password}`)}`;
  }

  const urls = [WR_XML_FEED(dealerId), WR_XML_FEED_ALT(dealerId)];
  let xml = '';
  let lastErr = '';

  for (const url of urls) {
    try {
      const response = await fetch(url, { headers: requestHeaders });
      if (!response.ok) {
        lastErr = `${response.status} ${response.statusText} @ ${url}`;
        console.log('WR feed non-OK:', lastErr);
        continue;
      }

      const body = await response.text();
      const trimmed = body?.trim() || '';
      const looksLikeXml = trimmed.startsWith('<?xml') ||
        trimmed.includes('<Inventory') ||
        trimmed.includes('<inventory') ||
        trimmed.includes('<Vehicles') ||
        trimmed.includes('<vehicles') ||
        trimmed.includes('<Vehicle') ||
        trimmed.includes('<vehicle');

      if (looksLikeXml) {
        xml = body;
        break;
      }

      lastErr = `Non-XML response from ${url}`;
      console.log('WR feed returned non-XML content:', lastErr);
    } catch (error) {
      lastErr = error instanceof Error ? error.message : 'Unknown fetch error';
      console.log('WR feed fetch error:', lastErr);
    }
  }

  if (xml) {
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
    const parsed = parser.parse(xml);
    const root = parsed?.Inventory || parsed?.inventory || parsed?.Vehicles || parsed?.vehicles || parsed;
    const rawList = toArray(root?.Vehicle || root?.vehicle || root?.Listing || root?.listing || []);

    return {
      source: 'wayne-reaves',
      rows: rawList.map((item) => normalizeInventoryRow(item as Record<string, unknown>, dealerId)),
      message: 'Loaded inventory from Wayne Reaves XML feed.',
      error: '',
    };
  }

  try {
    const fallbackResponse = await fetch(FALLBACK_JSON_URL, { headers: { Accept: 'application/json' } });
    if (!fallbackResponse.ok) {
      throw new Error(`Fallback fetch failed with ${fallbackResponse.status}`);
    }

    const fallbackData = await fallbackResponse.json();
    const fallbackList = Array.isArray(fallbackData)
      ? fallbackData
      : Array.isArray(fallbackData?.vehicles)
        ? fallbackData.vehicles
        : Array.isArray(fallbackData?.inventory)
          ? fallbackData.inventory
          : [];

    return {
      source: 'inventory-fallback',
      rows: fallbackList.map((item: Record<string, unknown>) => normalizeInventoryRow(item, dealerId)),
      message: 'Loaded inventory from fallback JSON feed.',
      error: '',
    };
  } catch (error) {
    return {
      source: 'wayne-reaves-unavailable',
      rows: [],
      message: `Wayne Reaves feed temporarily unavailable. ${lastErr}`,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function rowToVehicle(row: InventoryCacheRow) {
  const normalizedBadge = typeof row.badge === 'string' && /fallback|demo|available|in stock/i.test(row.badge)
    ? null
    : row.badge;

  // Parse raw mileage from DB
  let rawMileage = typeof row.mileage === 'number' 
    ? row.mileage 
    : Number(String(row.mileage || '').replace(/,/g, '').trim());

  let mileageText = 'TBD';

  if (Number.isFinite(rawMileage) && rawMileage > 0) {
    // If dealer feed stored mileage in thousands (e.g., 17, 26, 18), scale it to real mileage
    if (rawMileage < 1000) {
      rawMileage *= 1000;
    }
    mileageText = rawMileage.toLocaleString();
  }

  return {
    id: row.stock_number || row.vin,
    name: [row.year, row.make, row.model].filter(Boolean).join(' ').trim(),
    price: row.price ?? 0,
    image: row.image || '',
    year: row.year,
    mileage: mileageText, // Formats as '17,000' so the UI can append 'mi' seamlessly
    fuel: row.fuel || 'Gasoline',
    badge: normalizedBadge || 'Available',
    transmission: row.transmission || 'Automatic',
    engine: row.engine || '',
    drivetrain: row.drivetrain || 'FWD',
    mpgCity: null,
    mpgHighway: null,
    horsepower: null,
    seating: 5,
    warranty: 'Extended Available',
    vin: row.vin,
    exteriorColor: row.color_exterior,
    interiorColor: row.color_interior,
    stockNumber: row.stock_number,
    description: row.description || '',
    features: row.features || [],
    photos: row.photos || [],
  };
}

async function listFromCache(client: any) {
  const { data, error } = await client.from('inventory').select('*').order('price', { ascending: true, nullsFirst: false });
  if (error) throw error;

  return (data || []).map((row: InventoryCacheRow) => rowToVehicle(row));
}

async function detailFromCache(client: any, vehicleId: string | number) {
  const { data, error } = await client.from('inventory').select('*').order('price', { ascending: true, nullsFirst: false });
  if (error) throw error;

  const target = String(vehicleId).trim();
  const matches = (data || []).filter((row: any) => {
    return String(row.vin) === target || String(row.stock_number) === target || String(row.id) === target;
  });

  return matches.map((row: InventoryCacheRow) => rowToVehicle(row));
}

async function syncCache(client: any, dealerId: string) {
  const feed = await fetchInventoryRowsFromFeed(dealerId);
  if (!feed.rows.length) {
    return {
      success: true,
      total: 0,
      source: feed.source,
      message: feed.message,
    };
  }

  const vehiclesToUpsert = feed.rows.map((row: InventoryCacheRow) => ({
    ...row,
    updated_at: new Date().toISOString(),
  }));

  const { error: upsertError } = await client.from('inventory_cache').upsert(vehiclesToUpsert, { onConflict: 'vin' });
  if (upsertError) throw upsertError;

  return {
    success: true,
    total: vehiclesToUpsert.length,
    source: feed.source,
    message: feed.message,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const dealerId = Deno.env.get('WAYNEREAVES_DEALER_ID') || '47651';
    const client = getSupabaseClient();

    if (!dealerId) {
      return jsonResponse({
        success: true,
        vehicles: [],
        isDemo: true,
        message: 'Wayne Reaves dealer ID not configured.',
      });
    }

    let body: Record<string, unknown> = {};
    try {
      body = await req.json() as Record<string, unknown>;
    } catch {
      body = { action: 'list' };
    }

    const action = String(body.action || 'list');
    const vehicleId = body.vehicleId;
    console.log(`Wayne Reaves request: action=${action} dealer=${dealerId}`);

    if (!client) {
      return jsonResponse({
        success: true,
        vehicles: [],
        total: 0,
        isDemo: true,
        source: 'inventory-db-unavailable',
        message: 'Supabase client configuration is unavailable.',
      });
    }

    if (action === 'sync') {
      const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_SECRET');
      if (!serviceRoleKey) {
        return jsonResponse({
          success: false,
          vehicles: [],
          message: 'Service role key is not configured for inventory sync.',
        }, 500);
      }

      const syncResult = await syncCache(client, dealerId);
      return jsonResponse({
        success: true,
        vehicles: [],
        total: syncResult.total,
        source: syncResult.source,
        message: syncResult.message,
      });
    }

    let vehicles: unknown[] = [];
    if (action === 'detail' && vehicleId) {
      vehicles = await detailFromCache(client, String(vehicleId));
    } else {
      vehicles = await listFromCache(client);
    }

    return jsonResponse({
      success: true,
      vehicles,
      total: vehicles.length,
      isDemo: false,
      source: 'inventory-db',
    });
  } catch (error) {
    console.error('Wayne Reaves function error:', error);
    const message = error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : JSON.stringify(error);

    return jsonResponse({
      success: false,
      vehicles: [],
      error: message || 'Unknown error',
    }, 500);
  }
});
