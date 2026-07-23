import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGenerateDescription } from "@/hooks/useGenerateDescription";
import { Loader2, Sparkles, Copy, Check } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function AdminDescriptions() {
  const { generateDescription, isGenerating, description } = useGenerateDescription();
  const [copied, setCopied] = useState(false);
  
  const [vehicle, setVehicle] = useState({
    make: "",
    model: "",
    year: "",
    mileage: "",
    price: "",
    fuelType: "",
    transmission: "",
    features: "",
  });

  const handleGenerate = async () => {
    if (!vehicle.make || !vehicle.model) {
      toast({
        title: "Missing Information",
        description: "Please enter at least the make and model.",
        variant: "destructive",
      });
      return;
    }

    await generateDescription({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year ? parseInt(vehicle.year) : undefined,
      mileage: vehicle.mileage ? parseInt(vehicle.mileage.replace(/,/g, "")) : undefined,
      price: vehicle.price ? parseInt(vehicle.price.replace(/,/g, "")) : undefined,
      fuelType: vehicle.fuelType || undefined,
      transmission: vehicle.transmission || undefined,
      features: vehicle.features ? vehicle.features.split(",").map((f) => f.trim()) : undefined,
    });
  };

  const handleCopy = async () => {
    if (description) {
      await navigator.clipboard.writeText(description);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Description copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Description Generator</h1>
          <p className="text-muted-foreground">
            Generate compelling AI-written descriptions for your vehicle listings.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
              <CardDescription>
                Enter the vehicle details to generate a description.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="make">Make *</Label>
                  <Input
                    id="make"
                    placeholder="e.g., Toyota"
                    value={vehicle.make}
                    onChange={(e) => setVehicle({ ...vehicle, make: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    placeholder="e.g., Camry"
                    value={vehicle.model}
                    onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="e.g., 2022"
                    value={vehicle.year}
                    onChange={(e) => setVehicle({ ...vehicle, year: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mileage">Mileage</Label>
                  <Input
                    id="mileage"
                    placeholder="e.g., 25,000"
                    value={vehicle.mileage}
                    onChange={(e) => setVehicle({ ...vehicle, mileage: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  placeholder="e.g., 28,500"
                  value={vehicle.price}
                  onChange={(e) => setVehicle({ ...vehicle, price: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fuelType">Fuel Type</Label>
                  <Select
                    value={vehicle.fuelType}
                    onValueChange={(value) => setVehicle({ ...vehicle, fuelType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gasoline">Gasoline</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                      <SelectItem value="Electric">Electric</SelectItem>
                      <SelectItem value="Plug-in Hybrid">Plug-in Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transmission">Transmission</Label>
                  <Select
                    value={vehicle.transmission}
                    onValueChange={(value) => setVehicle({ ...vehicle, transmission: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Automatic">Automatic</SelectItem>
                      <SelectItem value="Manual">Manual</SelectItem>
                      <SelectItem value="CVT">CVT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="features">Features (comma-separated)</Label>
                <Textarea
                  id="features"
                  placeholder="e.g., Leather seats, Sunroof, Navigation, Backup camera"
                  value={vehicle.features}
                  onChange={(e) => setVehicle({ ...vehicle, features: e.target.value })}
                  rows={3}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Description
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Description</CardTitle>
              <CardDescription>
                Copy and use this description for your vehicle listing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {description ? (
                <div className="space-y-4">
                  <div className="relative">
                    <div className="rounded-lg border border-border bg-muted/50 p-4">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {description}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <>
                          <Check className="mr-1 h-3 w-3" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1 h-3 w-3" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    Enter vehicle details and click generate to create a description.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
