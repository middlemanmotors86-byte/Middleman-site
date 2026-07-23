import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchDMSInventory, fetchDMSVehicleDetail, syncDMSInventory, DMSVehicle, DMSResponse } from "@/lib/dms";
import { toast } from "sonner";

/**
 * Hook for fetching DMS inventory with caching and auto-refresh
 */
export function useDMSInventory() {
  return useQuery<DMSResponse>({
    queryKey: ['dms-inventory'],
    queryFn: fetchDMSInventory,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchInterval: 10 * 60 * 1000, // Auto-refresh every 10 minutes
    retry: 2,
  });
}

/**
 * Hook for fetching single vehicle details
 */
export function useDMSVehicleDetail(vehicleId: string | number | null) {
  return useQuery<DMSVehicle | null>({
    queryKey: ['dms-vehicle', vehicleId],
    queryFn: () => vehicleId ? fetchDMSVehicleDetail(vehicleId) : null,
    enabled: !!vehicleId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for manual inventory sync
 */
export function useDMSSync() {
  const queryClient = useQueryClient();

  const sync = async () => {
    toast.loading('Syncing inventory...');
    const result = await syncDMSInventory();
    
    if (result.success) {
      toast.success(result.message);
      // Invalidate inventory cache to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['dms-inventory'] });
    } else {
      toast.error('Sync failed', { description: result.message });
    }
    
    return result;
  };

  return { sync };
}
