/**
 * Public-facing price markup.
 * Internal/admin tools see raw vehicle.price.
 * Customers on public UI see price + markup.
 */
export const PUBLIC_PRICE_MARKUP = 2500;

export const toPublicPrice = (rawPrice: number): number => {
  if (!rawPrice || rawPrice <= 0) return 0;
  return rawPrice + PUBLIC_PRICE_MARKUP;
};

export const formatPublicPrice = (rawPrice: number): string => {
  const adjusted = toPublicPrice(rawPrice);
  return `$${adjusted.toLocaleString()}`;
};
