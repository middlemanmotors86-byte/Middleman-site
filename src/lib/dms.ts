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

function normalizeVehicleForDisplay(vehicle: DMSVehicle): DMSVehicle {
  const badge = normalizeInventoryBadge(vehicle.badge);
  const mileage = formatInventoryMileage(vehicle.mileage as number | string | undefined);

  return {
    ...vehicle,
    badge: badge ?? 'Available',
    mileage,
  };
}

const INVENTORY_FUNCTION_NAMES = [
  import.meta.env.VITE_SUPABASE_INVENTORY_FUNCTION_NAME,
  'waynereaves-inventory',
  'waynesreaves-inventory',
].filter((value): value is string => Boolean(value));

async function invokeInventoryFunction(body: Record<string, unknown>) {
  const seenNames = new Set<string>();

  for (const functionName of INVENTORY_FUNCTION_NAMES) {
    if (seenNames.has(functionName)) continue;
    seenNames.add(functionName);

    try {
      const result = await supabase.functions.invoke(functionName, { body });
      if (!result.error) {
        return result;
      }

      console.warn(`Inventory edge function "${functionName}" failed:`, result.error.message);
    } catch (error) {
      console.warn(`Inventory edge function "${functionName}" threw:`, error);
    }
  }

  return {
    data: null,
    error: new Error('Unable to reach the inventory edge function.'),
  };
}

/**
 * Fetch inventory from AutoManager DMS via edge function
 */
export async function fetchDMSInventory(): Promise<DMSResponse> {
  try {
    const { data, error } = await invokeInventoryFunction({ action: 'list' });

    if (error) {
      console.error('Error fetching Wayne Reaves inventory:', error);
      return {
        success: false,
        vehicles: [],
        error: error.message,
        isDemo: true,
        message: error.message || 'Unable to reach the inventory edge function.'
      };
    }

    // If the edge function returns no vehicles, preserve the empty response instead of
    // masking it with the local sample data unless the function itself errored.
    if (Array.isArray(data?.vehicles) && data.vehicles.length > 0) {
      return {
        success: true,
        vehicles: (data.vehicles as DMSVehicle[]).map(normalizeVehicleForDisplay),
        total: data.total ?? data.vehicles.length,
        isDemo: Boolean(data.isDemo),
        message: data.message,
      };
    }

    if (data?.message) {
      console.log('Inventory function returned a message:', data.message);
    }

    return {
      success: true,
      vehicles: ((data?.vehicles as DMSVehicle[] | undefined) ?? []).map(normalizeVehicleForDisplay),
      total: data?.total ?? 0,
      isDemo: Boolean(data?.isDemo),
      message: data?.message || 'No inventory returned from the edge function.',
    };

  } catch (error) {
    console.error('DMS fetch error:', error);
    return {
      success: false,
      vehicles: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      isDemo: true,
      message: 'Unable to reach the inventory edge function.'
    };
  }
}

/**
 * Fetch single vehicle details from DMS
 */
export async function fetchDMSVehicleDetail(vehicleId: string | number): Promise<DMSVehicle | null> {
  try {
    const { data, error } = await invokeInventoryFunction({ action: 'detail', vehicleId });

    if (error || !data?.vehicles?.length) {
      return null;
    }

    return data.vehicles[0];

  } catch (error) {
    console.error('DMS vehicle detail error:', error);
    return null;
  }
}

/**
 * Trigger inventory sync with DMS
 */
export async function syncDMSInventory(): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await invokeInventoryFunction({ action: 'sync' });

    if (error) {
      return { success: false, message: error.message };
    }

    return { 
      success: true, 
      message: `Synced ${data?.total || 0} vehicles from DMS` 
    };

  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Sync failed' 
    };
  }
}

export const syncInventoryToDatabase = async () => {
  const { data, error } = await supabase.functions.invoke('waynesreaves-inventory', {
    body: { action: 'sync' },
  });

  if (error) {
    console.error('Sync failed:', error);
    return false;
  }

  console.log('Sync complete:', data);
  return true;
};
