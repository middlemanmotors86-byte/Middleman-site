import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface VehicleInfo {
  make?: string;
  model?: string;
  year?: number;
  mileage?: number;
  price?: number;
  fuelType?: string;
  transmission?: string;
  features?: string[];
}

export function useGenerateDescription() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [description, setDescription] = useState<string | null>(null);

  const generateDescription = async (vehicle: VehicleInfo): Promise<string | null> => {
    setIsGenerating(true);
    setDescription(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-description", {
        body: { vehicle },
      });

      if (error) {
        console.error("Generate description error:", error);
        toast({
          title: "Error",
          description: "Failed to generate description. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      if (data?.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        return null;
      }

      setDescription(data.description);
      return data.description;
    } catch (error) {
      console.error("Generate description error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateDescription,
    isGenerating,
    description,
    clearDescription: () => setDescription(null),
  };
}
