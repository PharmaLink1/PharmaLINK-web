// Read/write types for pharmacy registration, admin pharmacy review, the admin
// medicine catalogue, and pharmacist inventory. JSON casing is snake_case on
// responses to match the other read-side modules; request bodies follow the
// endpoints they post to.

/** Pharmacy verification lifecycle. A pharmacy only appears in patient search once
 * it is "verified". */
export type VerifiedStatus = "pending" | "verified" | "rejected";

/** Weekly operating schedule. */
export type Hours = {
  mon?: string;
  tue?: string;
  wed?: string;
  thu?: string;
  fri?: string;
  sat?: string;
  sun?: string;
  is24h?: boolean;
};

/** Body for POST /pharmacies. Note: this endpoint uses camelCase for the URL fields. */
export type RegisterPharmacyRequest = {
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  hours: Hours;
  businessLicenseUrl: string;
  profileUrl?: string;
  bannerUrl?: string;
};

/** Data from POST /pharmacies. */
export type RegisterPharmacyResponse = {
  pharmacy_id: string;
  verified_status: VerifiedStatus;
};

/** One of the caller's own pharmacies, from GET /pharmacies/mine. */
export type MyPharmacy = {
  pharmacy_id: string;
  name: string;
  verified_status: VerifiedStatus;
  rejection_reason?: string;
};

/** Full public details of one pharmacy, from GET /pharmacies/{id} (no auth). The
 * business license URL is intentionally excluded from public output. `is_open_now`
 * and `hours_today` are computed server-side in East Africa Time; `hours_today` is
 * an English label ("Closed" / "24 Hours" / a span), so the UI renders the weekly
 * `hours` map itself to stay localized. */
export type PharmacyDetail = {
  pharmacy_id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  hours: Hours;
  is_open_now: boolean;
  hours_today: string;
  verified_status: VerifiedStatus;
  rejection_reason?: string;
  profile_url?: string;
  banner_url?: string;
  created_at: string;
};

/** One pharmacy in the nearby locator results, from GET /pharmacies (no auth). A lighter
 * read model than PharmacyDetail — the map/list essentials plus the server-computed
 * distance. `hours_today` is an English label (localize like the detail page), and
 * `is_open_now` is computed server-side in East Africa Time. */
export type PharmacyListItem = {
  pharmacy_id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  profile_url?: string;
  is_open_now: boolean;
  hours_today: string;
  verified_status: VerifiedStatus;
  distance_m: number;
};

/** A pharmacy in the admin review queue, from GET /admin/pharmacies. */
export type AdminPharmacy = {
  pharmacy_id: string;
  owner_id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  verified_status: VerifiedStatus;
  rejection_reason?: string;
  business_license_url: string;
  created_at: string;
};

/** Admin decision on a pending pharmacy. */
export type ReviewAction = "verify" | "reject";

/** Body for POST /admin/pharmacies/{pharmacy_id}/review. */
export type ReviewPharmacyRequest = {
  action: ReviewAction;
  notes?: string;
};

/** Body for POST /medicines. */
export type CreateMedicineRequest = {
  generic_name: string;
  brand_name?: string;
  brand_names?: string[];
  amharic_name?: string;
  aliases?: string[];
  dosage_form?: string;
  strength?: string;
};

/** One catalogue medicine, from the admin medicine endpoints. */
export type CatalogMedicine = {
  medicine_id: string;
  generic_name: string;
  brand_name?: string;
  brand_names?: string[];
  amharic_name?: string;
  aliases?: string[];
  dosage_form?: string;
  strength?: string;
};

/** Stock status a listing can carry. The dashboard endpoints also accept "unknown"
 * (the schema default), but the pharmacist UI only ever sets in/low/out. */
export type StockStatusValue = "in_stock" | "low_stock" | "out_of_stock";

/** Body for PUT /dashboard/{pharmacyId}/listings/{medicineId}. The pharmacy and
 * medicine are in the path, so only the reported stock/price go in the body. Unlike
 * the read-side modules above, the dashboard API is camelCase. */
export type SetListingRequest = {
  stockStatus: string;
  /** null or omitted when the pharmacy lists no price. Omitting it keeps the
   * listing's existing price — the backend never clears one. */
  price?: number | null;
  currency?: string;
};

/** One row of GET /dashboard/{pharmacyId}/listings. The backend names the medicine,
 * so the table renders without a per-row lookup. camelCase, matching the dashboard API. */
export type InventoryListing = {
  id: string;
  medicineId: string;
  medicineName: string;
  stockStatus: string;
  price: number | null;
  currency: string;
  updatedAt: string;
};

/** Data from PUT /dashboard/{pharmacyId}/listings/{medicineId}. It carries no
 * medicineName, so after an upsert the UI reuses the picked medicine's label. */
export type SavedListing = {
  id: string;
  medicineId: string;
  stockStatus: string;
  price: number | null;
  currency: string;
  updatedBy: string;
  updatedAt: string;
};

/** Look-back window accepted by GET /dashboard/{pharmacyId}/analytics. An omitted
 * window is read as 30d, and the response echoes the canonical label back. */
export type AnalyticsPeriod = "7d" | "30d" | "90d";

/** One medicine patients searched for near the pharmacy that it cannot sell today. */
export type UnmetDemandItem = {
  medicineId: string;
  medicineName: string;
  searchCount: number;
};

/** Data from GET /dashboard/{pharmacyId}/analytics. unmetDemand is [] (never null)
 * when the pharmacy is missing nothing, and is capped by the backend, busiest first. */
export type PharmacyAnalytics = {
  period: string;
  unmetDemand: UnmetDemandItem[];
};

