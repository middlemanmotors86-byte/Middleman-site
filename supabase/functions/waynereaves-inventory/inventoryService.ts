import { supabase } from "@/integrations/supabase/client";

export interface Vehicle {
  id: string;
  name: string;
  price: number;
  image: string;
  year: number;
  mileage: string;
  fuel: string;
  badge: string;
  transmission?: string;
  engine?: string;
  drivetrain?: string;
  mpgCity?: number;
  mpgHighway?: number;
  horsepower?: number;
  seating?: number;
  warranty?: string;
  vin?: string;
  exteriorColor?: string;
  interiorColor?: string;
  stockNumber?: string;
  description?: string;
  features?: string[];
  photos?: { url: string; caption?: string }[];
  [key: string]: any;
}

interface EdgeFunctionResponse {
  success: boolean;
  vehicles: Vehicle[];
  total: number;
  isDemo: boolean;
  source: string;
  message?: string;
  error?: string;
}

/**
 * Fetches the list of vehicles by invoking the Supabase Edge Function.
 * @returns A promise that resolves to an array of vehicle objects.
 */
export const fetchInventory = async (): Promise<Vehicle[]> => {
  const { data, error } = await supabase.functions.invoke("waynesreaves-inventory", {
    body: { action: "list" },
  });

  if (error) {
    console.error("Error fetching Wayne Reaves inventory:", error);
    return [];
  }

  const responseData = data as EdgeFunctionResponse;
  if (!responseData.success) {
    console.error("Edge Function returned an error:", responseData.error || responseData.message);
    return [];
  }

  return responseData.vehicles || [];
};