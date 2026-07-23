import { Helmet } from "react-helmet-async";
import { useComparisonStore } from "@/stores/comparisonStore";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Check, 
  X, 
  Calendar, 
  Gauge, 
  Fuel, 
  Settings2,
  Zap,
  Users,
  Shield,
  Car,
  Trash2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatPublicPrice, toPublicPrice } from "@/lib/publicPricing";

const VehicleComparison = () => {
  const { vehicles, removeVehicle, clearAll } = useComparisonStore();
  const navigate = useNavigate();

  const specs = [
    { key: "year", label: "Year", icon: Calendar },
    { key: "mileage", label: "Mileage", icon: Gauge },
    { key: "fuel", label: "Fuel Type", icon: Fuel },
    { key: "transmission", label: "Transmission", icon: Settings2 },
    { key: "engine", label: "Engine", icon: Car },
    { key: "drivetrain", label: "Drivetrain", icon: Settings2 },
    { key: "horsepower", label: "Horsepower", icon: Zap, suffix: " HP" },
    { key: "mpgCity", label: "MPG City", icon: Fuel },
    { key: "mpgHighway", label: "MPG Highway", icon: Fuel },
    { key: "seating", label: "Seating", icon: Users, suffix: " passengers" },
    { key: "warranty", label: "Warranty", icon: Shield },
  ];

  const getBestValue = (key: string) => {
    if (vehicles.length < 2) return null;
    
    const numericKeys = ['price', 'mpgCity', 'mpgHighway', 'horsepower'];
    const lowerIsBetterKeys = ['price'];
    
    if (!numericKeys.includes(key)) return null;
    
    const values = vehicles.map(v => v[key as keyof typeof v] as number);
    
    if (lowerIsBetterKeys.includes(key)) {
      const minVal = Math.min(...values);
      return vehicles.find(v => v[key as keyof typeof v] === minVal)?.id;
    } else {
      const maxVal = Math.max(...values);
      return vehicles.find(v => v[key as keyof typeof v] === maxVal)?.id;
    }
  };

  if (vehicles.length === 0) {
    return (
      <>
        <Helmet>
          <title>Compare Vehicles | Middleman Motors LLC</title>
          <meta name="description" content="Compare vehicles side by side at Middleman Motors LLC." />
        </Helmet>
        <Navbar />
        <main className="min-h-screen bg-background pt-32 pb-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Car className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl font-heading font-bold text-foreground mb-4">
                No Vehicles to Compare
              </h1>
              <p className="text-muted-foreground mb-8">
                Add vehicles from our inventory to start comparing specs, prices, and features side by side.
              </p>
              <Button variant="hero" onClick={() => navigate('/#inventory')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Browse Inventory
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Compare Vehicles | Middleman Motors LLC</title>
        <meta name="description" content="Compare vehicles side by side at Middleman Motors LLC. Find the perfect car for your needs." />
        <link rel="canonical" href="https://www.middlemanmotors.com/compare" />
        <meta property="og:title" content="Compare Vehicles | Middleman Motors LLC" />
        <meta property="og:description" content="Compare vehicles side by side to find the perfect car." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.middlemanmotors.com/compare" />
      </Helmet>
      <Navbar />
      
      <main className="min-h-screen bg-background pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')}
                className="mb-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Inventory
              </Button>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
                Compare <span className="text-gradient-gold">Vehicles</span>
              </h1>
              <p className="text-muted-foreground mt-2">
                Comparing {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} side by side
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={clearAll}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </Button>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Vehicle Cards Row */}
              <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `200px repeat(${vehicles.length}, 1fr)` }}>
                <div /> {/* Empty cell for labels column */}
                {vehicles.map((vehicle) => (
                  <div 
                    key={vehicle.id} 
                    className="bg-card border border-border rounded-xl overflow-hidden group"
                  >
                    <div className="relative h-48">
                      <img
                        src={vehicle.image}
                        alt={vehicle.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeVehicle(vehicle.id)}
                        className="absolute top-2 right-2 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {vehicle.badge && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded">
                          {vehicle.badge}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-heading font-bold text-lg text-foreground mb-2">
                        {vehicle.name}
                      </h3>
                      <p className={`text-2xl font-bold ${getBestValue('price') === vehicle.id ? 'text-green-500' : 'text-gradient-gold'}`}>
                        {formatPublicPrice(vehicle.price)}
                        {getBestValue('price') === vehicle.id && (
                          <span className="text-xs font-normal ml-2 bg-green-500/10 text-green-500 px-2 py-1 rounded">
                            Best Price
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Specs Comparison */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                {specs.map((spec, index) => {
                  const bestId = getBestValue(spec.key);
                  
                  return (
                    <div 
                      key={spec.key}
                      className={`grid gap-4 ${index !== specs.length - 1 ? 'border-b border-border' : ''}`}
                      style={{ gridTemplateColumns: `200px repeat(${vehicles.length}, 1fr)` }}
                    >
                      {/* Label */}
                      <div className="flex items-center gap-3 p-4 bg-secondary/30">
                        <spec.icon className="w-5 h-5 text-primary" />
                        <span className="font-medium text-foreground">{spec.label}</span>
                      </div>
                      
                      {/* Values */}
                      {vehicles.map((vehicle) => {
                        const value = vehicle[spec.key as keyof typeof vehicle];
                        const isBest = bestId === vehicle.id;
                        
                        return (
                          <div 
                            key={vehicle.id}
                            className={`flex items-center justify-center p-4 text-center ${isBest ? 'bg-green-500/5' : ''}`}
                          >
                            <span className={`${isBest ? 'text-green-500 font-semibold' : 'text-muted-foreground'}`}>
                              {value !== undefined ? `${value}${spec.suffix || ''}` : '—'}
                              {isBest && <Check className="w-4 h-4 inline ml-1" />}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* CTA Row */}
              <div 
                className="grid gap-4 mt-6" 
                style={{ gridTemplateColumns: `200px repeat(${vehicles.length}, 1fr)` }}
              >
                <div /> {/* Empty cell */}
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="flex flex-col gap-2">
                    <Button variant="hero" className="w-full">
                      Schedule Test Drive
                    </Button>
                    <Button variant="outline" className="w-full">
                      Get Pre-Approved
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Add More Vehicles CTA */}
          {vehicles.length < 3 && (
            <div className="mt-12 text-center">
              <p className="text-muted-foreground mb-4">
                Add {3 - vehicles.length} more vehicle{3 - vehicles.length !== 1 ? 's' : ''} to compare
              </p>
              <Button variant="outline" onClick={() => navigate('/#inventory')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Add More Vehicles
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default VehicleComparison;
