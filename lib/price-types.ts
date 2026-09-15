// Read-side types for GET /medicines/{medicine_id}/prices (source of truth:
// /c/Code/development/PharmaLINK-backend, internal/price_comparison/dto). Field
// names mirror the API responses exactly.

/** Sort orders the endpoint accepts; anything else is rejected with INVALID_SORT. */
export type PriceSort = "price_asc" | "distance";

/** One pharmacy's entry in the price comparison for a single medicine. */
export type PriceComparisonItem = {
  pharmacy_id: string;
  pharmacy_name: string;
  // Null when the pharmacy carries the medicine but has not listed a price yet.
  // price_listed is what tells that apart from a real 0.
  price_etb: number | null;
  price_listed: boolean;
  distance_m: number;
  last_updated_at: string;
};
