import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Vehicle } from '@/types/vehicle';

interface ComparisonStore {
  vehicles: Vehicle[];
  maxVehicles: number;
  
  addVehicle: (vehicle: Vehicle) => boolean;
  removeVehicle: (vehicleId: number) => void;
  clearAll: () => void;
  isInComparison: (vehicleId: number) => boolean;
  canAddMore: () => boolean;
}

export const useComparisonStore = create<ComparisonStore>()(
  persist(
    (set, get) => ({
      vehicles: [],
      maxVehicles: 3,

      addVehicle: (vehicle) => {
        const { vehicles, maxVehicles, isInComparison } = get();
        
        if (isInComparison(vehicle.id)) {
          return false;
        }
        
        if (vehicles.length >= maxVehicles) {
          return false;
        }
        
        set({ vehicles: [...vehicles, vehicle] });
        return true;
      },

      removeVehicle: (vehicleId) => {
        set({
          vehicles: get().vehicles.filter(v => v.id !== vehicleId)
        });
      },

      clearAll: () => {
        set({ vehicles: [] });
      },

      isInComparison: (vehicleId) => {
        return get().vehicles.some(v => v.id === vehicleId);
      },

      canAddMore: () => {
        return get().vehicles.length < get().maxVehicles;
      },
    }),
    {
      name: 'vehicle-comparison',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
