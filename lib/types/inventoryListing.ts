export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface InventoryListing {
  id: string;
  pharmacyId: string;
  medicineId: string;
  stockStatus: StockStatus;
  /** null/undefined renders as "Price not listed" per PRD §6.3 — never hidden. */
  price: number | null;
  currency: "ETB";
  updatedAt: string;
  updatedBy: string;
}

/**
 * Joined shape used on Search Results / Pharmacy Detail (Inventory Listing bowtie Pharmacy, PRD §8).
 */
export interface PharmacyListingResult extends InventoryListing {
  pharmacy: Pick<
    import("./pharmacy").Pharmacy,
    "id" | "name" | "distanceKm" | "isOpenNow" | "lat" | "lng"
  >;
}
