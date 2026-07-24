import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

function helperArray(x: any) {
  if (!x) return [];
  return Array.isArray(x) ? x : [x];
}

function parseYear(value: any) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function parseNumber(value: any) {
  if (value === null || value === undefined || value === '') return 0;
  const cleaned = String(value).replace(/,/g, '').replace(/[^0-9.-]/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function parseMakeModel(value: any, fallbackName = '') {
  const source = String(value || fallbackName || '').trim();
  if (!source) return { make: '', model: '' };

  const yearMatch = source.match(/^(\d{4})\s+/);
  const withoutYear = yearMatch ? source.replace(yearMatch[0], '').trim() : source;

  const parts = withoutYear.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { make: '', model: withoutYear };

  const make = parts[0];
  const model = parts.slice(1).join(' ');
  return { make, model };
}

async function seedDatabase() {
  const filePath = join(process.cwd(), 'public', 'inventory-fallback.json');
  const rawData = readFileSync(filePath, 'utf-8');
  const { vehicles: rawVehicles } = JSON.parse(rawData);

  console.log(`Normalizing ${rawVehicles.length} vehicles...`);

  const normalized = rawVehicles.map((v: any) => {
    const { make: parsedMake, model: parsedModel } = parseMakeModel(v.make || v.Make || v.MAKE || v.model || v.Model || v.MODEL || v.name || v.Name || v.title || '', v.name || v.Name || v.title || '');
    const make = (v.make || v.Make || v.MAKE || parsedMake || '').toString().trim();
    const model = (v.model || v.Model || v.MODEL || parsedModel || '').toString().trim();
    const year = parseYear(v.year || v.Year || v.modelYear || v.ModelYear || 0);

    const price = parseNumber(v.price || v.SellingPrice || v.Price || v.retailPrice || v.salePrice || v.SalePrice || 0);
    const rawMileage = parseNumber(v.mileage || v.Mileage || v.Odometer || v.odometer || 0);
    
    let mileage = rawMileage;
    // If mileage is passed in thousands (e.g. 17, 16, 26), scale to actual miles
    if (mileage > 0 && mileage < 1000) {
      mileage *= 1000;
    }
    let rawPhotos = v.photos || v.Photos || v.images || v.Images || [];
    if (rawPhotos?.Photo) rawPhotos = rawPhotos.Photo;
    if (rawPhotos?.Image) rawPhotos = rawPhotos.Image;

    const photosList = helperArray(rawPhotos)
      .map((p: any) => (typeof p === 'string' ? p : p?.url || p?.URL || p?.['#text'] || ''))
      .filter(Boolean);

    const primaryImage = v.image || v.Image || photosList[0] || '';

    const vin = v.vin || v.VIN || v.Vin || v.stock_number || v.StockNumber || `TEMP-${Math.random()}`;
    const stockNumber = v.stockNumber || v.StockNumber || v.stock_number || v.StockNumber || v.stock || v.Stock || vin;

    return {
      vin,
      stock_number: String(stockNumber),
      year,
      make,
      model,
      price,
      mileage: mileage,
      fuel: v.fuel || v.FuelType || v.fuelType || 'Gasoline',
      transmission: v.transmission || v.Transmission || 'Automatic',
      engine: v.engine || v.Engine || '',
      drivetrain: v.drivetrain || v.Drivetrain || '',
      color_exterior: v.exteriorColor || v.ExteriorColor || v.colorExterior || '',
      color_interior: v.interiorColor || v.InteriorColor || v.colorInterior || '',
      description: v.description || v.Description || v.name || v.Name || '',
      badge: v.badge || v.Badge || 'Available',
      features: Array.isArray(v.features) ? v.features : [],
      photos: photosList.map((url: string) => ({ url })),
      image: primaryImage,
      data: v,
      updated_at: new Date().toISOString(),
    };
  });

  console.log(`Upserting ${normalized.length} normalized records into inventory_cache...`);

  // Target 'inventory_cache' since that's what your frontend reads!
  const { error } = await supabase
    .from('inventory_cache')
    .upsert(normalized, { onConflict: 'vin' });

  if (error) {
    console.error('Upsert failed:', error);
  } else {
    console.log(`✅ Successfully populated inventory_cache with photos, makes, models, and prices!`);
  }
}

seedDatabase();