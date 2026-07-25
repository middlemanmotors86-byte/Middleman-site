import 'dotenv/config';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import { readFileSync, existsSync } from 'node:fs';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

function parseNumber(val: any): number {
  if (val === null || val === undefined || val === '') return 0;
  const cleaned = String(val).replace(/,/g, '').replace(/[^0-9.-]/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

async function seedFromXlsx() {
  // Path to your spreadsheet file
  const filePath = join(process.cwd(), 'example-feed.xlsx');
  
  if (!existsSync(filePath)) {
    console.error(`❌ Error: Spreadsheet not found at ${filePath}`);
    console.error('Please make sure the "example-feed.xlsx" file is in your project root directory.');
    process.exit(1);
  }

  console.log(`📖 Reading Excel file: ${filePath}...`);
  const fileBuffer = readFileSync(filePath);
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert Excel sheet rows into JSON objects using row headers
  const rawRows: any[] = XLSX.utils.sheet_to_json(sheet);
  console.log(`Found ${rawRows.length} rows in spreadsheet.`);

  const normalized = rawRows.map((row, idx) => {
    // Map exact Excel header names to inventory_cache columns
    const year = parseNumber(row['Year'] || row['year']);
    const make = String(row['Make'] || row['make'] || 'Unknown').trim();
    const model = String(row['Model'] || row['model'] || 'Vehicle').trim();
    const trim = String(row['Trim'] || row['trim'] || '').trim();
    
    // Combine Model + Trim if trim exists
    const fullModel = trim ? `${model} ${trim}` : model;

    const vin = String(row['VIN'] || row['Vin'] || row['vin'] || row['Stock No'] || row['Stock'] || `FEED-${idx + 1}-${Date.now()}`).trim();
    const stockNumber = String(row['Stock No'] || row['Stock'] || row['StockNo'] || vin).trim();

    const price = parseNumber(row['Price'] || row['Cost'] || 0);
    const mileage = parseNumber(row['Mileage'] || 0);

    return {
      vin,
      stock_number: stockNumber,
      year,
      make,
      model: fullModel,
      price,
      mileage,
      fuel: String(row['Fuel'] || 'Gasoline').trim(),
      transmission: String(row['Transmission'] || 'Automatic').trim(),
      engine: String(row['Engine'] || '').trim(),
      drivetrain: String(row['Drive Train'] || row['Drivetrain'] || '').trim(),
      color_exterior: String(row['Exterior Color'] || row['Exterior'] || '').trim(),
      color_interior: String(row['Interior Color'] || row['Interior'] || '').trim(),
      description: String(row['Description'] || `${year} ${make} ${fullModel}`).trim(),
      badge: 'Available',
      features: row['Options'] ? String(row['Options']).split(',').map(s => s.trim()) : [],
      photos: [], // Add default image or photo logic if URLs exist
      image: '',
      data: row, // Store full raw row as JSONB backup
      updated_at: new Date().toISOString(),
    };
  });

  console.log(`🚀 Upserting ${normalized.length} cars into inventory_cache...`);

  const { error } = await supabase
    .from('inventory_cache')
    .upsert(normalized, { onConflict: 'vin' });

  if (error) {
    console.error('❌ Upsert failed:', error);
  } else {
    console.log(`✅ Success! Upserted ${normalized.length} vehicles directly from Excel feed!`);
  }
}

seedFromXlsx();