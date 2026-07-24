import { fetchDMSInventory } from "@/lib/dms";
import type { Vehicle } from "@/types/vehicle";

export type { Vehicle } from "@/types/vehicle";
export { vehicleInventory } from "@/types/vehicle";

export const fetchInventory = async (): Promise<Vehicle[]> => {
  const response = await fetchDMSInventory();
  if (response.success && Array.isArray(response.vehicles)) {
    return response.vehicles as Vehicle[];
  }
  return [];
};
