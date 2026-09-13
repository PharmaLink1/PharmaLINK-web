import type { PharmacyListingResult } from "@/lib/types/inventoryListing";

/**
 * Shaped exactly like the real Inventory Listing ⨝ Pharmacy join (PRD §8)
 * that the Go backend will eventually return for a medicine search. The
 * five entries mirror the exact spread of states shown in Page 7's Figma
 * frame (node 6:519) — in stock/open, in stock/open, low stock/open, in
 * stock/closed with no price, out of stock/open — so every visual state
 * (badge color, dimmed unavailable cards, price-not-listed) is exercised
 * with real search data instead of only ever showing the "happy path".
 */
export function getMockSearchResults(medicineId: string): PharmacyListingResult[] {
  return [
    {
      id: "listing_1",
      pharmacyId: "pharm_1",
      medicineId,
      stockStatus: "in_stock",
      price: 42,
      currency: "ETB",
      updatedAt: new Date().toISOString(),
      updatedBy: "staff_1",
      pharmacy: {
        id: "pharm_1",
        name: "Bole Medico Pharmacy",
        distanceKm: 0.8,
        isOpenNow: true,
        lat: 8.9931,
        lng: 38.7892,
      },
    },
    {
      id: "listing_2",
      pharmacyId: "pharm_2",
      medicineId,
      stockStatus: "in_stock",
      price: 45,
      currency: "ETB",
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updatedBy: "staff_2",
      pharmacy: {
        id: "pharm_2",
        name: "Unity Health Pharmacy",
        distanceKm: 1.2,
        isOpenNow: true,
        lat: 9.0129,
        lng: 38.7614,
      },
    },
    {
      id: "listing_3",
      pharmacyId: "pharm_3",
      medicineId,
      stockStatus: "low_stock",
      price: 50,
      currency: "ETB",
      updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      updatedBy: "staff_3",
      pharmacy: {
        id: "pharm_3",
        name: "Sunshine Pharmacy",
        distanceKm: 1.5,
        isOpenNow: true,
        lat: 9.0198,
        lng: 38.8017,
      },
    },
    {
      id: "listing_4",
      pharmacyId: "pharm_4",
      medicineId,
      stockStatus: "in_stock",
      price: null,
      currency: "ETB",
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedBy: "staff_4",
      pharmacy: {
        id: "pharm_4",
        name: "Central Care Pharmacy",
        distanceKm: 2.1,
        isOpenNow: false,
        lat: 9.005,
        lng: 38.76,
      },
    },
    {
      id: "listing_5",
      pharmacyId: "pharm_5",
      medicineId,
      stockStatus: "out_of_stock",
      price: 48,
      currency: "ETB",
      updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      updatedBy: "staff_5",
      pharmacy: {
        id: "pharm_5",
        name: "Ethio Pharmacy",
        distanceKm: 2.5,
        isOpenNow: true,
        lat: 9.021,
        lng: 38.79,
      },
    },
  ];
}
