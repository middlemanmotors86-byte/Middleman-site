import 'dotenv/config';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import XLSX from 'xlsx';

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

function parseString(val: any): string {
  if (val === null || val === undefined) return '';
  return String(val).trim();
}

function parsePictures(val: any): { primaryImage: string; photosList: Array<{ url: string }> } {
  const rawStr = parseString(val);
  if (!rawStr) {
    return { primaryImage: '', photosList: [] };
  }

  // Split by comma or whitespace, filter valid URLs
  const urls = rawStr
    .split(',')
    .map(u => u.trim())
    .filter(u => u.startsWith('http://') || u.startsWith('https://'));

  const primaryImage = urls.length > 0 ? urls[0] : '';
  const photosList = urls.map(url => ({ url }));

  return { primaryImage, photosList };
}

async function seedFromXlsx() {
  const filePath = join(process.cwd(), 'example-feed.xlsx');

  if (!existsSync(filePath)) {
    console.error(`❌ Error: Spreadsheet not found at ${filePath}`);
    process.exit(1);
  }

  console.log(`📖 Reading Excel file: ${filePath}...`);
  const fileBuffer = readFileSync(filePath);
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const rawRows: any[] = XLSX.utils.sheet_to_json(sheet);
  console.log(`Found ${rawRows.length} rows in spreadsheet.`);

  const normalized = rawRows.map((row, idx) => {
    // 1. Primary identifiers
    const vin = parseString(row['VIN']) || parseString(row['Stock No']) || `FEED-${idx + 1}`;
    const stockNumber = parseString(row['Stock No']) || vin;

    // 2. Specifications
    const year = parseNumber(row['Year']);
    const make = parseString(row['Make']);
    const model = parseString(row['Model']);
    const trim = parseString(row['Trim']);
    const style = parseString(row['Style']);
    const bodyStyle = parseString(row['Body Style']) || style;

    // Combine Model + Trim for frontend rendering
    const fullModel = trim ? `${model} ${trim}` : model;

    // 3. Pricing
    const price = parseNumber(row['Price']) || parseNumber(row['Sale Price']) || parseNumber(row['Cost']);
    const salePrice = parseNumber(row['Sale Price']);
    const cost = parseNumber(row['Cost']);
    const wholesalePrice = parseNumber(row['Wholesale Price']);

    // 4. Vehicle Details
    const mileage = parseNumber(row['Mileage']);
    const engine = parseString(row['Engine']);
    const cylinders = parseNumber(row['Cylinders']);
    const doors = parseNumber(row['Doors'] || row['Doors.1']);
    const transmission = parseString(row['Transmission']);
    const fuel = parseString(row['Fuel']);
    const drivetrain = parseString(row['Drive Train']);
    const colorExterior = parseString(row['Exterior Color']);
    const colorInterior = parseString(row['Interior Color']);
    const description = parseString(row['Description']) || `${year} ${make} ${fullModel}`;

    // 5. Options & Features
    const rawOptions = parseString(row['Options']);
    const features = rawOptions ? rawOptions.split(',').map(s => s.trim()).filter(Boolean) : [];

    // 6. Real Pictures from 'Pictures' column
    const { primaryImage, photosList } = parsePictures(row['Pictures']);

    return {
      vin,
      stock_number: stockNumber,
      year,
      make,
      model: fullModel,
      price,
      mileage,
      fuel,
      transmission,
      engine,
      drivetrain,
      color_exterior: colorExterior,
      color_interior: colorInterior,
      description,
      badge: 'Available',
      features,
      photos: photosList,
      image: primaryImage,
      data: {
        ...row, // Preserve all 25 raw columns as JSONB
        trim,
        style,
        body_style: bodyStyle,
        cylinders,
        doors,
        cost,
        sale_price: salePrice,
        wholesale_price: wholesalePrice,
      },
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
    console.log(`✅ Success! Upserted ${normalized.length} real vehicles with genuine photos!`);
  }
}

seedFromXlsx();