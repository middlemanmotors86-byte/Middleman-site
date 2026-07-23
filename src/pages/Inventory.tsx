import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Search,
  SlidersHorizontal,
  Calendar,
  Fuel,
  Gauge,
  Scale,
  Check,
  X,
  RotateCcw,
  Grid3X3,
  List,
} from "lucide-react";
import { vehicleInventory, Vehicle } from "@/types/vehicle";
import { useComparisonStore } from "@/stores/comparisonStore";
import { useToast } from "@/hooks/use-toast";
import { formatPublicPrice, toPublicPrice } from "@/lib/publicPricing";
import { useDMSInventory } from "@/hooks/useDMSInventory";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ComparisonBar from "@/components/ComparisonBar";


type SortOption = "price-asc" | "price-desc" | "year-desc" | "year-asc" | "mileage-asc" | "mileage-desc";

const Inventory = () => {
  const { addVehicle, removeVehicle, isInComparison, canAddMore } = useComparisonStore();
  const { toast } = useToast();
  const { data: dmsData, isLoading: dmsLoading } = useDMSInventory();

  // Prefer live Wayne Reaves inventory; fall back to local sample only when the feed is empty.
  const inventorySource = useMemo<Vehicle[]>(() => {
    const live = dmsData?.vehicles as Vehicle[] | undefined;
    if (live && live.length > 0) return live;
    return vehicleInventory;
  }, [dmsData]);
  const isLive = !!(dmsData?.vehicles && dmsData.vehicles.length > 0 && !dmsData.isDemo);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("price-asc");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [yearRange, setYearRange] = useState<[number, number]>([2018, 2024]);
  const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>([]);
  const [maxMileage, setMaxMileage] = useState<number>(100000);
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Get unique fuel types from inventory
  const fuelTypes = useMemo(() => {
    const types = new Set(inventorySource.map((v) => v.fuel));
    return Array.from(types);
  }, [inventorySource]);

  // Parse mileage string to number for filtering
  const parseMileage = (mileage: string | number): number => {
    if (typeof mileage === "number") return mileage;
    return parseInt(String(mileage).replace(/,/g, "")) || 0;
  };

  // Filter and sort vehicles
  const filteredVehicles = useMemo(() => {
    let filtered = inventorySource.filter((vehicle) => {

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          vehicle.name.toLowerCase().includes(query) ||
          vehicle.fuel.toLowerCase().includes(query) ||
          vehicle.engine?.toLowerCase().includes(query) ||
          vehicle.transmission?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Price range (compare against public-facing price)
      const publicPrice = toPublicPrice(vehicle.price);
      if (publicPrice < priceRange[0] || publicPrice > priceRange[1]) {
        return false;
      }

      // Year range
      if (vehicle.year < yearRange[0] || vehicle.year > yearRange[1]) {
        return false;
      }

      // Fuel type
      if (selectedFuelTypes.length > 0 && !selectedFuelTypes.includes(vehicle.fuel)) {
        return false;
      }

      // Mileage
      if (parseMileage(vehicle.mileage) > maxMileage) {
        return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "year-desc":
          return b.year - a.year;
        case "year-asc":
          return a.year - b.year;
        case "mileage-asc":
          return parseMileage(a.mileage) - parseMileage(b.mileage);
        case "mileage-desc":
          return parseMileage(b.mileage) - parseMileage(a.mileage);
        default:
          return 0;
      }
    });

    return filtered;
  }, [inventorySource, searchQuery, priceRange, yearRange, selectedFuelTypes, maxMileage, sortBy]);

  const handleCompareClick = (car: Vehicle) => {
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

  const toggleFuelType = (fuel: string) => {
    setSelectedFuelTypes((prev) =>
      prev.includes(fuel) ? prev.filter((f) => f !== fuel) : [...prev, fuel]
    );
  };

  const resetFilters = () => {
    setSearchQuery("");
    setPriceRange([0, 50000]);
    setYearRange([2018, 2024]);
    setSelectedFuelTypes([]);
    setMaxMileage(100000);
    setSortBy("price-asc");
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (priceRange[0] > 0 || priceRange[1] < 50000) count++;
    if (yearRange[0] > 2018 || yearRange[1] < 2024) count++;
    if (selectedFuelTypes.length > 0) count++;
    if (maxMileage < 100000) count++;
    return count;
  }, [priceRange, yearRange, selectedFuelTypes, maxMileage]);

  return (
    <>
      <Helmet>
        <title>Vehicle Inventory | Middleman Motors LLC</title>
        <meta
          name="description"
          content="Browse our full inventory of quality used cars at Middleman Motors LLC. Filter by price, year, mileage, and more."
        />
        <link rel="canonical" href="https://www.middlemanmotors.com/inventory" />
        <meta property="og:title" content="Vehicle Inventory | Middleman Motors LLC" />
        <meta property="og:description" content="Browse quality inspected used cars. Filter by price, year, and mileage." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.middlemanmotors.com/inventory" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Vehicle Inventory",
            "url": "https://www.middlemanmotors.com/inventory",
            "description": "Used vehicle inventory at Middleman Motors LLC in Snellville, GA.",
            "isPartOf": { "@type": "WebSite", "name": "Middleman Motors", "url": "https://www.middlemanmotors.com/" }
          })}
        </script>
      </Helmet>
      <Navbar />

      <main className="min-h-screen bg-background pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="text-primary font-medium tracking-wider uppercase text-sm">
              Browse Our Selection
            </span>
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground mt-2 mb-4">
              Full <span className="text-gradient-gold">Inventory</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {dmsLoading ? "Loading live inventory..." : `${filteredVehicles.length} vehicles available.`} Use filters to find your perfect match.
            </p>
            {isLive && (
              <p className="mt-2 text-xs uppercase tracking-widest text-primary/80">
                Live feed · Wayne Reaves Pro DMS
              </p>
            )}

          </div>

          {/* Search and Controls Bar */}
          <div className="bg-card border border-border rounded-xl p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by make, model, features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-secondary border-border"
                />
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-full lg:w-[200px] h-11 bg-secondary border-border">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="year-desc">Year: Newest First</SelectItem>
                  <SelectItem value="year-asc">Year: Oldest First</SelectItem>
                  <SelectItem value="mileage-asc">Mileage: Low to High</SelectItem>
                  <SelectItem value="mileage-desc">Mileage: High to Low</SelectItem>
                </SelectContent>
              </Select>

              {/* View toggle */}
              <div className="flex gap-1 bg-secondary rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="h-9 w-9"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="h-9 w-9"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              {/* Toggle filters */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="bg-primary text-primary-foreground h-5 w-5 p-0 flex items-center justify-center">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-border animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Price Range */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">
                      Price Range
                    </label>
                    <Slider
                      value={priceRange}
                      onValueChange={(v) => setPriceRange(v as [number, number])}
                      min={0}
                      max={50000}
                      step={1000}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>${priceRange[0].toLocaleString()}</span>
                      <span>${priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Year Range */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">
                      Year
                    </label>
                    <Slider
                      value={yearRange}
                      onValueChange={(v) => setYearRange(v as [number, number])}
                      min={2015}
                      max={2024}
                      step={1}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{yearRange[0]}</span>
                      <span>{yearRange[1]}</span>
                    </div>
                  </div>

                  {/* Max Mileage */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">
                      Max Mileage
                    </label>
                    <Slider
                      value={[maxMileage]}
                      onValueChange={(v) => setMaxMileage(v[0])}
                      min={0}
                      max={100000}
                      step={5000}
                      className="mb-2"
                    />
                    <div className="text-sm text-muted-foreground">
                      Up to {maxMileage.toLocaleString()} miles
                    </div>
                  </div>

                  {/* Fuel Type */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">
                      Fuel Type
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {fuelTypes.map((fuel) => (
                        <button
                          key={fuel}
                          onClick={() => toggleFuelType(fuel)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                            selectedFuelTypes.includes(fuel)
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {fuel}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reset Filters */}
                {activeFilterCount > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-2">
                      <RotateCcw className="w-4 h-4" />
                      Reset All Filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Results */}
          {filteredVehicles.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-heading font-bold text-foreground mb-2">
                No vehicles found
              </h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or search terms
              </p>
              <Button variant="outline" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVehicles.map((car, index) => {
                const inComparison = isInComparison(car.id);

                return (
                  <Card
                    key={car.id}
                    className={`bg-card border-border overflow-hidden group transition-all duration-300 animate-slide-up ${
                      inComparison ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/50"
                    }`}
                    style={{ animationDelay: `${(index % 8) * 0.05}s` }}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={car.image}
                        alt={car.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                        {car.badge}
                      </Badge>
                      <button
                        onClick={() => handleCompareClick(car)}
                        className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                          inComparison
                            ? "bg-primary text-primary-foreground"
                            : "bg-background/80 backdrop-blur-sm text-foreground hover:bg-primary hover:text-primary-foreground"
                        }`}
                        title={inComparison ? "Remove from comparison" : "Add to comparison"}
                      >
                        {inComparison ? <Check className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
                      </button>
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                        {car.name}
                      </h3>

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

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-lg font-heading font-bold text-gradient-gold">
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
          ) : (
            // List view
            <div className="space-y-4">
              {filteredVehicles.map((car, index) => {
                const inComparison = isInComparison(car.id);

                return (
                  <Card
                    key={car.id}
                    className={`bg-card border-border overflow-hidden group transition-all duration-300 animate-slide-up ${
                      inComparison ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/50"
                    }`}
                    style={{ animationDelay: `${(index % 8) * 0.05}s` }}
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="relative w-full md:w-64 h-48 md:h-auto overflow-hidden flex-shrink-0">
                        <img
                          src={car.image}
                          alt={car.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                          {car.badge}
                        </Badge>
                      </div>

                      <CardContent className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-heading font-semibold text-xl text-foreground">
                              {car.name}
                            </h3>
                          </div>

                          <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
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
                            {car.transmission && (
                              <span className="text-muted-foreground">{car.transmission}</span>
                            )}
                            {car.drivetrain && (
                              <span className="text-muted-foreground">{car.drivetrain}</span>
                            )}
                          </div>

                          {car.engine && (
                            <p className="text-sm text-muted-foreground mb-4">{car.engine}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xl font-heading font-bold text-gradient-gold mr-auto">
                            {formatPublicPrice(car.price)}
                          </span>
                          <Button variant="hero" size="sm">
                            View Details
                          </Button>
                          <Button
                            variant={inComparison ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleCompareClick(car)}
                            className="gap-2"
                          >
                            {inComparison ? (
                              <>
                                <Check className="w-4 h-4" />
                                In Comparison
                              </>
                            ) : (
                              <>
                                <Scale className="w-4 h-4" />
                                Compare
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <ComparisonBar />
    </>
  );
};

export default Inventory;
