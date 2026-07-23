import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDMSInventory, useDMSSync } from "@/hooks/useDMSInventory";
import { useGenerateDescription } from "@/hooks/useGenerateDescription";
import { DMSVehicle } from "@/lib/dms";
import { toast } from "@/components/ui/use-toast";
import { PUBLIC_PRICE_MARKUP, toPublicPrice } from "@/lib/publicPricing";
import {
  Loader2,
  RefreshCw,
  Search,
  Eye,
  Sparkles,
  Car,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export default function AdminInventory() {
  const { data: inventoryData, isLoading, refetch, isRefetching } = useDMSInventory();
  const { sync } = useDMSSync();
  const { generateDescription, isGenerating } = useGenerateDescription();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBadge, setFilterBadge] = useState<string>("all");
  const [selectedVehicle, setSelectedVehicle] = useState<DMSVehicle | null>(null);
  const [generatedDescription, setGeneratedDescription] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const vehicles = inventoryData?.vehicles || [];
  const isDemo = inventoryData?.isDemo;

  // Filter vehicles
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.vin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.stockNumber?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBadge = filterBadge === "all" || vehicle.badge === filterBadge;

    return matchesSearch && matchesBadge;
  });

  // Get unique badges for filter
  const uniqueBadges = [...new Set(vehicles.map((v) => v.badge))];

  const handleSync = async () => {
    setIsSyncing(true);
    await sync();
    setIsSyncing(false);
  };

  const handleViewVehicle = (vehicle: DMSVehicle) => {
    setSelectedVehicle(vehicle);
    setGeneratedDescription(null);
  };

  const handleGenerateDescription = async () => {
    if (!selectedVehicle) return;

    const description = await generateDescription({
      make: selectedVehicle.name.split(" ").slice(1, -1).join(" ") || "Vehicle",
      model: selectedVehicle.name.split(" ").pop() || "",
      year: selectedVehicle.year,
      mileage: parseInt(selectedVehicle.mileage.replace(/,/g, "")) || undefined,
      price: selectedVehicle.price,
      fuelType: selectedVehicle.fuel,
      transmission: selectedVehicle.transmission,
      features: selectedVehicle.features,
    });

    if (description) {
      setGeneratedDescription(description);
    }
  };

  const handleCopyDescription = async () => {
    if (generatedDescription) {
      await navigator.clipboard.writeText(generatedDescription);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Description copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
            <p className="text-muted-foreground">
              View and manage your vehicle inventory from AutoManager DMS.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              {isRefetching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
            <Button onClick={handleSync} disabled={isSyncing}>
              {isSyncing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Sync with DMS
            </Button>
          </div>
        </div>

        {/* Status Banner */}
        {isDemo && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <div className="flex-1">
              <p className="font-medium text-foreground">Demo Mode Active</p>
              <p className="text-sm text-muted-foreground">
                Showing sample inventory data. Configure your AutoManager API credentials to connect to your DMS.
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/admin">View Setup Instructions</a>
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Vehicles
              </CardTitle>
              <Car className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vehicles.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {vehicles.length > 0
                  ? formatPrice(
                      vehicles.reduce((sum, v) => sum + v.price, 0) / vehicles.length
                    )
                  : "$0"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Low Miles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {vehicles.filter((v) => v.badge === "Low Miles").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Like New
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {vehicles.filter((v) => v.badge === "Like New").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Inventory</CardTitle>
            <CardDescription>
              {filteredVehicles.length} of {vehicles.length} vehicles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, VIN, or stock #..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterBadge} onValueChange={setFilterBadge}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by badge" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Badges</SelectItem>
                  {uniqueBadges.map((badge) => (
                    <SelectItem key={badge} value={badge}>
                      {badge}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No vehicles found matching your criteria.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Mileage</TableHead>
                    <TableHead>Raw Price</TableHead>
                    <TableHead>Public Price Preview</TableHead>
                    <TableHead>Badge</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {vehicle.image && (
                            <img
                              src={vehicle.image}
                              alt={vehicle.name}
                              className="h-10 w-14 rounded object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium">{vehicle.name}</p>
                            {vehicle.stockNumber && (
                              <p className="text-xs text-muted-foreground">
                                Stock: {vehicle.stockNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{vehicle.year}</TableCell>
                      <TableCell>{vehicle.mileage} mi</TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(vehicle.price)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm whitespace-nowrap">
                          <span className="text-muted-foreground">
                            {formatPrice(vehicle.price)}
                          </span>
                          <span className="text-muted-foreground">+</span>
                          <Badge variant="outline" className="font-mono">
                            ${PUBLIC_PRICE_MARKUP.toLocaleString()}
                          </Badge>
                          <span className="text-muted-foreground">=</span>
                          <span className="font-semibold text-primary">
                            {formatPrice(toPublicPrice(vehicle.price))}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{vehicle.badge}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewVehicle(vehicle)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                          >
                            <a href={`/product/${vehicle.id}`} target="_blank">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Vehicle Detail Dialog */}
        <Dialog open={!!selectedVehicle} onOpenChange={() => setSelectedVehicle(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedVehicle?.name}</DialogTitle>
              <DialogDescription>
                {selectedVehicle?.stockNumber && `Stock #${selectedVehicle.stockNumber}`}
                {selectedVehicle?.vin && ` • VIN: ${selectedVehicle.vin}`}
              </DialogDescription>
            </DialogHeader>

            {selectedVehicle && (
              <div className="space-y-6">
                {/* Vehicle Image */}
                {selectedVehicle.image && (
                  <img
                    src={selectedVehicle.image}
                    alt={selectedVehicle.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-primary">
                      {formatPrice(selectedVehicle.price)}
                    </p>
                    <p className="text-xs text-muted-foreground">Price</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{selectedVehicle.mileage}</p>
                    <p className="text-xs text-muted-foreground">Mileage</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{selectedVehicle.year}</p>
                    <p className="text-xs text-muted-foreground">Year</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-lg font-bold">{selectedVehicle.fuel}</p>
                    <p className="text-xs text-muted-foreground">Fuel Type</p>
                  </div>
                </div>

                {/* Specifications */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {selectedVehicle.transmission && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transmission</span>
                      <span className="font-medium">{selectedVehicle.transmission}</span>
                    </div>
                  )}
                  {selectedVehicle.drivetrain && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Drivetrain</span>
                      <span className="font-medium">{selectedVehicle.drivetrain}</span>
                    </div>
                  )}
                  {selectedVehicle.engine && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Engine</span>
                      <span className="font-medium">{selectedVehicle.engine}</span>
                    </div>
                  )}
                  {selectedVehicle.exteriorColor && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Exterior</span>
                      <span className="font-medium">{selectedVehicle.exteriorColor}</span>
                    </div>
                  )}
                  {selectedVehicle.interiorColor && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Interior</span>
                      <span className="font-medium">{selectedVehicle.interiorColor}</span>
                    </div>
                  )}
                  {selectedVehicle.horsepower && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Horsepower</span>
                      <span className="font-medium">{selectedVehicle.horsepower} hp</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                {selectedVehicle.features && selectedVehicle.features.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedVehicle.features.map((feature, index) => (
                        <Badge key={index} variant="outline">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Description Generator */}
                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">AI Description</h4>
                    <Button
                      size="sm"
                      onClick={handleGenerateDescription}
                      disabled={isGenerating}
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
                  </div>

                  {generatedDescription ? (
                    <div className="relative">
                      <div className="rounded-lg border border-border bg-muted/50 p-4">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {generatedDescription}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleCopyDescription}
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
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Click the button above to generate an AI-powered description for this vehicle.
                    </p>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
