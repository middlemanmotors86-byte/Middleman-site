export const normalizeInventoryBadge = (badge?: string | null): string | null => {
  const cleaned = (badge ?? "").trim();
  if (!cleaned) return null;

  if (/fallback|demo|available|in stock/i.test(cleaned)) {
    return null;
  }

  return cleaned;
};

export const formatInventoryMileage = (mileage: number | string | null | undefined): string => {
  if (mileage === null || mileage === undefined || mileage === "") {
    return "Mileage TBD";
  }

  let numericMileage = typeof mileage === "number"
    ? mileage
    : Number(String(mileage).replace(/,/g, "").trim());

  if (!Number.isFinite(numericMileage) || numericMileage <= 0) {
    return "Mileage TBD";
  }

  return numericMileage.toLocaleString();
};

export const parseInventoryMileage = (mileage: number | string | null | undefined): number => {
  if (mileage === null || mileage === undefined || mileage === "") {
    return 0;
  }

  let numericMileage = typeof mileage === "number"
    ? mileage
    : Number(String(mileage).replace(/,/g, "").trim());

  if (!Number.isFinite(numericMileage) || numericMileage <= 0) {
    return 0;
  }

  return numericMileage;
};