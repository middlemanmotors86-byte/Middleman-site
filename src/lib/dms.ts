import { supabase } from "@/integrations/supabase/client";
import { Vehicle, vehicleInventory } from "@/types/vehicle";

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

/**
 * Fetch inventory from AutoManager DMS via edge function
 */
export async function fetchDMSInventory(): Promise<DMSResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('waynereaves-inventory', {
      body: { action: 'list' }
    });

    if (error) {
      console.error('Error fetching Wayne Reaves inventory:', error);
      return {
        success: false,
        vehicles: vehicleInventory as DMSVehicle[],
        error: error.message,
        isDemo: true
      };
    }

    // If DMS returns no vehicles or is in demo mode, use local inventory
    if (!data?.vehicles?.length || data.isDemo) {
      console.log('Using local inventory data');
      return {
        success: true,
        vehicles: vehicleInventory as DMSVehicle[],
        total: vehicleInventory.length,
        isDemo: true,
        message: data?.message || 'Using demo inventory'
      };
    }

    return {
      success: true,
      vehicles: data.vehicles,
      total: data.total,
      isDemo: false
    };

  } catch (error) {
    console.error('DMS fetch error:', error);
    // Fallback to local inventory on any error
    return {
      success: false,
      vehicles: vehicleInventory as DMSVehicle[],
      error: error instanceof Error ? error.message : 'Unknown error',
      isDemo: true
    };
  }
}

/**
 * Fetch single vehicle details from DMS
 */
export async function fetchDMSVehicleDetail(vehicleId: string | number): Promise<DMSVehicle | null> {
  try {
    const { data, error } = await supabase.functions.invoke('waynereaves-inventory', {
      body: { action: 'detail', vehicleId }
    });

    if (error || !data?.vehicles?.length) {
      // Fallback to local inventory
      const localVehicle = vehicleInventory.find(v => v.id === Number(vehicleId));
      return localVehicle as DMSVehicle || null;
    }

    return data.vehicles[0];

  } catch (error) {
    console.error('DMS vehicle detail error:', error);
    const localVehicle = vehicleInventory.find(v => v.id === Number(vehicleId));
    return localVehicle as DMSVehicle || null;
  }
}

/**
 * Trigger inventory sync with DMS
 */
export async function syncDMSInventory(): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('waynereaves-inventory', {
      body: { action: 'sync' }
    });

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
