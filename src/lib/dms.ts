import { supabase } from "@/integrations/supabase/client";
import { type Vehicle } from "@/types/vehicle";
import { formatInventoryMileage, normalizeInventoryBadge } from "@/lib/inventoryDisplay";

export interface DMSVehicle extends Vehicle {
  vin?: string;
  exteriorColor?: string;
  interiorColor?: string;
  stockNumber?: string;
  description?: string;
  features?: string[];
  photos?: { url: string; caption?: string }[];
}

export interface DMSResponse {
  success: boolean;
  vehicles: DMSVehicle[];
  total?: number;
  isDemo?: boolean;
  message?: string;
  error?: string;
}

function rowToVehicle(row: Record<string, any>): DMSVehicle {
  return {
    id: row.stock_number || row.vin,
    name: [row.year, row.make, row.model].filter(Boolean).join(' ').trim(),
    price: row.price ?? 0,
    image: row.image || '',
    year: row.year,
    mileage: formatInventoryMileage(row.mileage),
    fuel: row.fuel || 'Gasoline',
    badge: normalizeInventoryBadge(row.badge) ?? 'Available',
    transmission: row.transmission || 'Automatic',
    engine: row.engine || '',
    drivetrain: row.drivetrain || 'FWD',
    vin: row.vin,
    exteriorColor: row.color_exterior,
    interiorColor: row.color_interior,
    stockNumber: row.stock_number,
    description: row.description || '',
    features: row.features || [],
    photos: row.photos || [],
  };
}

export async function fetchInventoryFromDB(): Promise<DMSVehicle[]> {
  const { data, error } = await supabase
    .from('inventory_cache')
    .select('*')
    .order('price', { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []).map(rowToVehicle);
}

/** Manually trigger a Wayne Reaves sync — admin use only, never called on page load */
export async function syncDMSInventory(): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('waynereaves-inventory', {
      body: { action: 'sync' },
    });
    if (error) return { success: false, message: error.message };
    return { success: true, message: `Synced ${data?.total || 0} vehicles` };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Sync failed' };
  }
}

/** Fetch a single vehicle detail directly from inventory_cache */
export async function fetchDMSVehicleDetail(vehicleId: string | number): Promise<DMSVehicle | null> {
  const target = String(vehicleId).trim();
  const { data, error } = await supabase
    .from('inventory_cache')
    .select('*')
    .or(`vin.eq.${target},stock_number.eq.${target}`)
    .limit(1)
    .single();

  if (error || !data) return null;
  return rowToVehicle(data);
}
