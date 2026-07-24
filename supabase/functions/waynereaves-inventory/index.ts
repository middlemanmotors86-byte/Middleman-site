import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { XMLParser } from "https://esm.sh/fast-xml-parser@4.3.6";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

// Wayne Reaves public inventory export endpoints. The dealer ID controls which lot is returned.
// Primary: XML export (no auth required, server-to-server).
const WR_XML_FEED = (dealerId: string) =>
  `https://www.waynereaves.com/InventoryExport.aspx?DealerID=${encodeURIComponent(dealerId)}&Format=XML`;
// Secondary mirror used by some Wayne Reaves Pro accounts.
const WR_XML_FEED_ALT = (dealerId: string) =>
  `https://wreav.es/InventoryExport.aspx?DealerID=${encodeURIComponent(dealerId)}&Format=XML`;

function determineBadge(v: any): string {
  const mileage = Number(v.mileage) || 0;
  const price = Number(v.price) || 0;
  const year = Number(v.year) || new Date().getFullYear();
  const currentYear = new Date().getFullYear();
  if (currentYear - year <= 1 && mileage < 20000) return 'Like New';
  if (mileage < 30000) return 'Low Miles';
  if (price > 0 && price < 20000) return 'Great Value';
  if (v.certified) return 'Certified';
  return 'Available';
}

function toArray<T>(x: T | T[] | undefined | null): T[] {
  if (x === undefined || x === null) return [];
  return Array.isArray(x) ? x : [x];
}

function normalizeVehicle(v: any) {
  const photos = toArray(v.Photos?.Photo ?? v.photos?.photo ?? v.Photo ?? v.photo)
    .map((p: any) => {
      if (typeof p === 'string') return { url: p };
      return { url: p?.URL || p?.url || p?.Url || p?.['#text'] || '', caption: p?.caption };
    })
    .filter((p: any) => !!p.url);

  const features = toArray(v.Features?.Feature ?? v.features?.feature)
    .map((f: any) => (typeof f === 'string' ? f : f?.['#text'] || f?.name))
    .filter(Boolean);

  const year = v.Year || v.year;
  const make = v.Make || v.make;
  const model = v.Model || v.model;
  const price = Number(v.SellingPrice || v.Price || v.price || 0);
  const mileage = Number(v.Mileage || v.mileage || 0);
  const stock = v.StockNumber || v.stockNumber || v.Stock || v.stock || v.ID || v.id;

  return {
    id: stock || v.VIN || v.vin,
    name: `${year || ''} ${make || ''} ${model || ''}`.trim(),
    price,
    image: photos[0]?.url || '',
    year,
    mileage: mileage.toLocaleString(),
    fuel: v.FuelType || v.fuelType || 'Gasoline',
    badge: determineBadge({ year, mileage, price, certified: v.Certified }),
    transmission: v.Transmission || v.transmission || 'Automatic',
    engine: v.Engine || v.engine || '',
    drivetrain: v.Drivetrain || v.DriveTrain || v.drivetrain || 'FWD',
    mpgCity: v.MPGCity || v.mpgCity || null,
    mpgHighway: v.MPGHighway || v.mpgHighway || null,
    horsepower: v.Horsepower || v.horsepower || null,
    seating: v.Seating || v.seating || 5,
    warranty: v.Warranty || 'Extended Available',
    vin: v.VIN || v.vin,
    exteriorColor: v.ExteriorColor || v.exteriorColor,
    interiorColor: v.InteriorColor || v.interiorColor,
    stockNumber: stock,
    description: v.Description || v.description || '',
    features,
    photos,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Public inventory feed — Wayne Reaves XML export is designed for public consumption
    // and powers the customer-facing inventory pages. No auth required.


    const dealerId = Deno.env.get('WAYNEREAVES_DEALER_ID');
    if (!dealerId) {
      return new Response(JSON.stringify({
        success: true, vehicles: [], isDemo: true,
        message: 'Wayne Reaves dealer ID not configured.',
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { action, vehicleId } = await req.json().catch(() => ({ action: 'list' }));
    console.log(`Wayne Reaves request: action=${action} dealer=${dealerId}`);

    // Fetch XML feed (try primary then alt)
    const urls = [WR_XML_FEED(dealerId), WR_XML_FEED_ALT(dealerId)];
    let xml = '';
    let lastErr = '';
    for (const url of urls) {
      try {
        const r = await fetch(url, {
          headers: { 'Accept': 'application/xml,text/xml,*/*', 'User-Agent': 'MiddlemanMotors/1.0' },
        });
        if (r.ok) {
          xml = await r.text();
          if (xml && xml.trim().length > 0) break;
        } else {
          lastErr = `${r.status} ${r.statusText} @ ${url}`;
          console.log('WR feed non-OK:', lastErr);
        }
      } catch (e) {
        lastErr = (e as Error).message;
        console.log('WR feed fetch error:', lastErr);
      }
    }

    if (!xml) {
      // Feed unreachable — return empty success so client falls back to mock inventory gracefully.
      console.log('WR feed unavailable, returning empty demo response:', lastErr);
      return new Response(JSON.stringify({
        success: true, vehicles: [], total: 0, isDemo: true,
        source: 'wayne-reaves-unavailable',
        message: `Wayne Reaves feed temporarily unavailable. ${lastErr}`,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
    const parsed = parser.parse(xml);

    // Wayne Reaves feed nests vehicles under Inventory > Vehicle (case may vary)
    const root = parsed?.Inventory || parsed?.inventory || parsed?.Vehicles || parsed?.vehicles || parsed;
    const rawList = toArray(root?.Vehicle || root?.vehicle || root?.Listing || root?.listing || []);

    let vehicles = rawList.map(normalizeVehicle);

    if (action === 'detail' && vehicleId) {
      vehicles = vehicles.filter(v =>
        String(v.id) === String(vehicleId) ||
        String(v.stockNumber) === String(vehicleId) ||
        String(v.vin) === String(vehicleId)
      );
    }

    return new Response(JSON.stringify({
      success: true,
      vehicles,
      total: vehicles.length,
      isDemo: false,
      source: 'wayne-reaves',
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Wayne Reaves function error:', error);
    return new Response(JSON.stringify({
      success: false,
      vehicles: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
