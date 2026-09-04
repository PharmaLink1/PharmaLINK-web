// Read-side types for the medicine search endpoints (source of truth:
// /c/Code/development/PharmaLINK-backend, internal/search/dto). Field names and
// JSON casing mirror the API responses exactly.

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";
export type StockConfidence = "high" | "medium" | "low";
export type MatchType = "generic" | "brand_alias" | "amharic" | "alias";

/** One medicine-at-a-pharmacy match from GET /medicines/search. */
export type MedicineSearchResult = {
  listing_id: string;
  pharmacy_id: string;
  pharmacy_name: string;
  lat: number;
  lng: number;
  medicine_id: string;
  matched_name: string;
  generic_name?: string;
  brand_name?: string;
  amharic_name?: string;
  dosage_form?: string;
  strength?: string;
  stock_status: StockStatus;
  stock_confidence: StockConfidence;
  price_etb: number | null;
  // Absent on the current backend (only the nearby-fallback carries a phone). Typed
  // now so the call button lights up automatically if search results gain one.
  phone?: string;
  distance_m: number | null;
  distance_label: string;
  last_updated_at: string;
};

/** Search results grouped by medicine for display: one card per medicine, its
 * pharmacy listings nested. Built client-side from the flat per-listing results. */
export type MedicineGroup = {
  medicine_id: string;
  matched_name: string;
  generic_name?: string;
  brand_name?: string;
  amharic_name?: string;
  dosage_form?: string;
  strength?: string;
  // True only when every listing is out of stock — drives the notify-me prompt.
  all_out_of_stock: boolean;
  listings: MedicineSearchResult[];
};

/** A nearby pharmacy fallback (search response nearby block). */
export type NearbyPharmacy = {
  pharmacy_id: string;
  pharmacy_name: string;
  phone?: string;
  lat: number;
  lng: number;
  distance_m: number;
};

export type SearchPagination = {
  page: number;
  limit: number;
  total: number;
};

/** GET /medicines/search response data. */
export type MedicineSearchResponse = {
  results: MedicineSearchResult[];
  nearby?: NearbyPharmacy[];
  pagination: SearchPagination;
};

/** Query params for GET /medicines/search. */
export type MedicineSearchParams = {
  q: string;
  lat?: number;
  lng?: number;
  // Only meaningful with a location; the client omits it when location is off.
  radius_km?: number;
  dosage_form?: string;
  status?: StockStatus;
  page?: number;
  limit?: number;
};

/** One as-you-type entry from GET /medicines/autocomplete. */
export type MedicineSuggestion = {
  medicine_id: string;
  display_name: string;
  match_type: MatchType;
  generic_name?: string;
  brand_name?: string;
  strength?: string;
};

/** Body for POST /medicines/{medicine_id}/notify-me. The camel radiusKm is mapped
 * to the wire's radius_km by the API client; omit it to take the backend default. */
export type NotifySubscribeRequest = {
  lat: number;
  lng: number;
  radiusKm?: number;
};

/** Data from POST /medicines/{medicine_id}/notify-me. */
export type NotifySubscribeResponse = {
  subscription_id: string;
  status: "active";
};
