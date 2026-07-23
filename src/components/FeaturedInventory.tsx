import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Fuel, Gauge, ChevronRight, Scale, Check } from "lucide-react";
import { useComparisonStore } from "@/stores/comparisonStore";
import { vehicleInventory, Vehicle } from "@/types/vehicle";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { formatPublicPrice } from "@/lib/publicPricing";
import { useDMSInventory } from "@/hooks/useDMSInventory";

const FeaturedInventory = () => {
  const { addVehicle, removeVehicle, isInComparison, canAddMore } = useComparisonStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data } = useDMSInventory();

  // Prefer live Wayne Reaves inventory; fall back to local sample if unavailable.
  const source = (data?.vehicles && data.vehicles.length > 0 ? data.vehicles : vehicleInventory) as Vehicle[];
  const featuredCars = source.slice(0, 4);


  const handleCompareClick = (car: typeof featuredCars[0]) => {
    if (isInComparison(car.id)) {
      removeVehicle(car.id);
      toast({
        title: "Removed from comparison",
        description: `${car.name} has been removed.`,
      });
    } else if (canAddMore()) {
      addVehicle(car);
      toast({
        title: "Added to comparison",
        description: `${car.name} added. Select more vehicles to compare.`,
      });
    } else {
      toast({
        title: "Comparison full",
        description: "Remove a vehicle to add another (max 3).",
        variant: "destructive",
      });
    }
  };

  return (
    <section id="inventory" className="py-20 bg-gradient-dark">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-primary font-medium tracking-wider uppercase text-sm">
            Our Selection
          </span>
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mt-2 mb-4">
            Featured <span className="text-gradient-gold">Inventory</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hand-picked vehicles that meet our strict quality standards. 
            Every car is inspected, certified, and ready for the road.
          </p>
        </div>

        {/* Car Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featuredCars.map((car, index) => {
            const inComparison = isInComparison(car.id);
            
            return (
              <Card
                key={car.id}
                className={`bg-card border-border overflow-hidden group transition-all duration-300 animate-slide-up ${
                  inComparison ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={car.image}
                    alt={car.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                    {car.badge}
                  </Badge>
                  
                  {/* Compare button overlay */}
                  <button
                    onClick={() => handleCompareClick(car)}
                    className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                      inComparison 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-background/80 backdrop-blur-sm text-foreground hover:bg-primary hover:text-primary-foreground'
                    }`}
                    title={inComparison ? "Remove from comparison" : "Add to comparison"}
                  >
                    {inComparison ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Scale className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                    {car.name}
                  </h3>
                  
                  {/* Specs */}
                  <div className="flex flex-wrap gap-3 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{car.year}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Gauge className="w-4 h-4" />
                      <span>{car.mileage} mi</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Fuel className="w-4 h-4" />
                      <span>{car.fuel}</span>
                    </div>
                  </div>

                  {/* Price + Actions */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xl font-heading font-bold text-gradient-gold">
                      {formatPublicPrice(car.price)}
                    </span>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

{/* View All Button */}
        <div className="text-center">
          <Button variant="gold" size="xl" onClick={() => navigate('/inventory')}>
            View All Inventory
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedInventory;
