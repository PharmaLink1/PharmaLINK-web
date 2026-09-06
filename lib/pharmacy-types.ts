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

/** Body for POST /admin/medicines. */
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

/** Stock status a listing can carry. Mirrors the search read-side values. */
export type StockStatusValue = "in_stock" | "low_stock" | "out_of_stock";

/** Body for PUT /pharmacies/{id}/inventory. */
export type SetListingRequest = {
  medicine_id: string;
  stock_status: string;
  /** null or omitted when the pharmacy lists no price. */
  price?: number | null;
  currency?: string;
};

/** One stored inventory listing. The backend attaches the medicine display fields
 * from the catalogue, so rows render a name without a second lookup. They are empty
 * only if the medicine was removed from the catalogue after the listing was made. */
export type InventoryListing = {
  listing_id: string;
  pharmacy_id: string;
  medicine_id: string;
  stock_status: string;
  price: number | null;
  currency: string;
  updated_at: string;
  generic_name?: string;
  brand_name?: string;
  amharic_name?: string;
  dosage_form?: string;
  strength?: string;
  /** Ready-to-render label, e.g. "Paracetamol 500mg (Panadol)". Falls back to the id. */
  display_name: string;
};
