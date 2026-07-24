import { useEffect, useState } from "react";
import { fetchDMSInventory, syncDMSInventory, type DMSVehicle } from "@/lib/dms";

interface DMSInventoryData {
  vehicles: DMSVehicle[];
  isDemo: boolean;
  source: string; // e.g., 'wayne-reaves' or 'local-fallback'
}

export const useDMSInventory = () => {
  const [data, setData] = useState<DMSInventoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadInventory = async () => {
    setIsLoading(true);
    setIsRefetching(true);
    setError(null);
    try {
      const response = await fetchDMSInventory();
      const fetchedVehicles = response.vehicles ?? [];

      setData({
        vehicles: fetchedVehicles as DMSVehicle[],
        isDemo: Boolean(response.isDemo),
        source: response.isDemo ? 'demo-fallback' : 'wayne-reaves',
      });

      if (!response.success) {
        setError(new Error(response.error || response.message || 'Failed to load inventory'));
      }
    } catch (err) {
      console.error("Failed to load DMS inventory:", err);
      setError(err instanceof Error ? err : new Error("Failed to load inventory"));
      setData({
        vehicles: [],
        isDemo: true,
        source: 'load-error',
      });
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  return { data, isLoading, isRefetching, error, refetch: loadInventory };
};

export const useDMSSync = () => {
  const sync = async () => {
    const result = await syncDMSInventory();
    if (!result.success) {
      throw new Error(result.message);
    }
    return result;
  };

  return { sync };
};