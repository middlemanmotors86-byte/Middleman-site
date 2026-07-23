import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useDMSInventory, useDMSSync } from "@/hooks/useDMSInventory";
import { DMSVehicle } from "@/lib/dms";
import { Car, Loader2, RefreshCw, Search, Clock, DollarSign, Gauge } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function parseMakeModel(name: string, year: number) {
  // "2021 Toyota Camry LE" -> make=Toyota, model="Camry LE"
  const parts = name.trim().split(/\s+/);
  const yearIdx = parts.findIndex((p) => p === String(year));
  const rest = yearIdx >= 0 ? parts.slice(yearIdx + 1) : parts;
  const [make = "", ...modelParts] = rest;
  return { make, model: modelParts.join(" ") };
}

export default function AdminInventoryLookup() {
  const { data, isLoading, dataUpdatedAt, refetch, isRefetching } = useDMSInventory();
  const { sync } = useDMSSync();

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [vin, setVin] = useState("");
  const [syncing, setSyncing] = useState(false);

  const vehicles = data?.vehicles ?? [];

  const results = useMemo(() => {
    const mk = make.trim().toLowerCase();
    const md = model.trim().toLowerCase();
    const yr = year.trim();
    const vn = vin.trim().toLowerCase();
    return vehicles
      .map((v) => ({ v, mm: parseMakeModel(v.name, v.year) }))
      .filter(({ v, mm }) => {
        if (mk && !mm.make.toLowerCase().includes(mk) && !v.name.toLowerCase().includes(mk)) return false;
        if (md && !mm.model.toLowerCase().includes(md) && !v.name.toLowerCase().includes(md)) return false;
        if (yr && String(v.year) !== yr) return false;
        if (vn && !(v.vin?.toLowerCase().includes(vn) ?? false)) return false;
        return true;
      })
      .map(({ v }) => v);
  }, [vehicles, make, model, year, vin]);

  const stats = useMemo(() => {
    const total = vehicles.length;
    const uniqueMakes = new Set(vehicles.map((v) => parseMakeModel(v.name, v.year).make)).size;
    const avgPrice = total ? Math.round(vehicles.reduce((s, v) => s + (v.price || 0), 0) / total) : 0;
    return { total, uniqueMakes, avgPrice, resultCount: results.length };
  }, [vehicles, results]);

  const handleSync = async () => {
    setSyncing(true);
    await sync();
    setSyncing(false);
  };

  const clear = () => { setMake(""); setModel(""); setYear(""); setVin(""); };
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold">Inventory Lookup</h1>
            <p className="text-muted-foreground">
              Search live DMS inventory by make, model, year, or VIN.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => refetch()} disabled={isRefetching}>
              {isRefetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Refresh
            </Button>
            <Button onClick={handleSync} disabled={syncing}>
              {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Sync DMS
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Vehicles</CardTitle>
              <Car className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">Unique Makes</CardTitle>
              <Gauge className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.uniqueMakes}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">Avg Price</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.avgPrice.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">Last Updated</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {lastUpdated ? formatDistanceToNow(lastUpdated, { addSuffix: true }) : "—"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {lastUpdated ? lastUpdated.toLocaleString() : ""}
                {data?.isDemo && <Badge variant="outline" className="ml-2">Demo</Badge>}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Search className="h-4 w-4" /> Lookup</CardTitle>
            <CardDescription>
              Showing {stats.resultCount} of {stats.total} vehicles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-5 items-end">
              <div className="space-y-1">
                <Label htmlFor="make" className="text-xs">Make</Label>
                <Input id="make" value={make} onChange={(e) => setMake(e.target.value)} placeholder="Toyota" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="model" className="text-xs">Model</Label>
                <Input id="model" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Camry" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="year" className="text-xs">Year</Label>
                <Input id="year" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2021" inputMode="numeric" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="vin" className="text-xs">VIN</Label>
                <Input id="vin" value={vin} onChange={(e) => setVin(e.target.value)} placeholder="Full or partial VIN" />
              </div>
              <Button variant="outline" onClick={clear}>Clear</Button>
            </div>

            <div className="mt-6">
              {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : results.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No matching vehicles.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Year</TableHead>
                      <TableHead>Make</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>VIN</TableHead>
                      <TableHead>Stock #</TableHead>
                      <TableHead>Mileage</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((v: DMSVehicle) => {
                      const mm = parseMakeModel(v.name, v.year);
                      return (
                        <TableRow key={v.id}>
                          <TableCell>{v.year}</TableCell>
                          <TableCell className="font-medium">{mm.make}</TableCell>
                          <TableCell>{mm.model}</TableCell>
                          <TableCell className="font-mono text-xs">{v.vin || "—"}</TableCell>
                          <TableCell>{v.stockNumber || "—"}</TableCell>
                          <TableCell>{v.mileage}</TableCell>
                          <TableCell className="text-right">${v.price.toLocaleString()}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
