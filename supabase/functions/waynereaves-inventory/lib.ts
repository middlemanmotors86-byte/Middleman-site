export interface InventoryPhoto {
  url: string;
  caption?: string;
}

export interface InventoryCacheRow {
  vin: string;
  dealer_id: string;
  stock_number?: string | null;
  year?: number | null;
  make?: string | null;
  model?: string | null;
  price?: number | null;
  mileage?: number | null;
  fuel?: string | null;
  transmission?: string | null;
  engine?: string | null;
  drivetrain?: string | null;
  color_exterior?: string | null;
  color_interior?: string | null;
  description?: string | null;
  badge?: string | null;
  features: string[];
  photos: InventoryPhoto[];
  image?: string | null;
  data?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export function toArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

export function determineBadge(v: {
  year?: number | string | null;
  mileage?: number | string | null;
  price?: number | string | null;
  certified?: boolean | string | null;
}): string {
  const mileage = Number(v.mileage) || 0;
  const price = Number(v.price) || 0;
  const year = Number(v.year) || new Date().getFullYear();
  const currentYear = new Date().getFullYear();
  if (currentYear - year <= 1 && mileage < 20000) return "Like New";
  if (mileage < 30000) return "Low Miles";
  if (price > 0 && price < 20000) return "Great Value";
  if (v.certified) return "Certified";
  return "Available";
}

function asString(value: unknown): string | undefined {
  if (typeof value === "string") return value.trim();
  if (value === undefined || value === null) return undefined;
  return String(value).trim();
}

function asNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizePhotos(value: unknown): InventoryPhoto[] {
  return toArray(value)
    .map((entry: unknown) => {
      if (typeof entry === "string") return { url: entry };
      if (typeof entry === "object" && entry !== null) {
        const item = entry as Record<string, unknown>;
        const url = asString(item.URL ?? item.url ?? item.Url ?? item["#text"]);
        if (!url) return null;
        return { url, caption: asString(item.caption) };
      }
      return null;
    })
    .filter((photo): photo is InventoryPhoto => Boolean(photo));
}

function normalizeFeatures(value: unknown): string[] {
  return toArray(value)
    .map((entry: unknown) => {
      if (typeof entry === "string") return entry;
      if (typeof entry === "object" && entry !== null) {
        const item = entry as Record<string, unknown>;
        return asString(item["#text"] ?? item.name ?? item.Name ?? item.value);
      }
      return undefined;
    })
    .filter((feature): feature is string => Boolean(feature));
}

export function normalizeInventoryRow(value: Record<string, unknown>, dealerId = "47651"): InventoryCacheRow {
  const source = value as Record<string, unknown>;
  const photos = normalizePhotos(
    (source.Photos as Record<string, unknown> | undefined)?.Photo ??
      (source.photos as Record<string, unknown> | undefined)?.photo ??
      (source.Photo as unknown) ??
      (source.photo as unknown),
  );
  const features = normalizeFeatures(
    (source.Features as Record<string, unknown> | undefined)?.Feature ??
      (source.features as Record<string, unknown> | undefined)?.feature ??
      (source.Feature as unknown) ??
      (source.feature as unknown),
  );

  const vin = asString(source.VIN ?? source.vin ?? source.Vin) || "";
  const stockNumber = asString(source.StockNumber ?? source.stockNumber ?? source.Stock ?? source.stock ?? source.ID ?? source.id);
  const year = asNumber(source.Year ?? source.year ?? source.YearModel);
  const make = asString(source.Make ?? source.make);
  const model = asString(source.Model ?? source.model);
  const price = asNumber(source.SellingPrice ?? source.Price ?? source.price);
  const mileage = asNumber(source.Mileage ?? source.mileage);
  const fuel = asString(source.FuelType ?? source.fuelType ?? source.Fuel);
  const transmission = asString(source.Transmission ?? source.transmission);
  const engine = asString(source.Engine ?? source.engine);
  const drivetrain = asString(source.Drivetrain ?? source.DriveTrain ?? source.drivetrain);
  const exteriorColor = asString(source.ExteriorColor ?? source.exteriorColor ?? source.ColorExterior);
  const interiorColor = asString(source.InteriorColor ?? source.interiorColor ?? source.ColorInterior);
  const description = asString(source.Description ?? source.description);

  return {
    vin,
    dealer_id: dealerId,
    stock_number: stockNumber ?? null,
    year: year ?? null,
    make: make ?? null,
    model: model ?? null,
    price: price ?? null,
    mileage: mileage ?? null,
    fuel: fuel ?? null,
    transmission: transmission ?? null,
    engine: engine ?? null,
    drivetrain: drivetrain ?? null,
    color_exterior: exteriorColor ?? null,
    color_interior: interiorColor ?? null,
    description: description ?? null,
    badge: determineBadge({ year, mileage, price, certified: Boolean(source.Certified ?? source.certified) }),
    features,
    photos,
    image: photos[0]?.url || "",
    data: source,
  };
}

export function normalizeVehicle(row: InventoryCacheRow) {
  const mileageText = typeof row.mileage === "number" ? row.mileage.toLocaleString() : row.mileage || "";
  return {
    id: row.stock_number || row.vin,
    name: [row.year, row.make, row.model].filter(Boolean).join(" ").trim(),
    price: row.price ?? 0,
    image: row.image || "",
    year: row.year,
    mileage: mileageText,
    fuel: row.fuel || "Gasoline",
    badge: row.badge || "Available",
    transmission: row.transmission || "Automatic",
    engine: row.engine || "",
    drivetrain: row.drivetrain || "FWD",
    mpgCity: null,
    mpgHighway: null,
    horsepower: null,
    seating: 5,
    warranty: "Extended Available",
    vin: row.vin,
    exteriorColor: row.color_exterior,
    interiorColor: row.color_interior,
    stockNumber: row.stock_number,
    description: row.description || "",
    features: row.features || [],
    photos: row.photos || [],
  };
}
