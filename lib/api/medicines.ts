import { apiRequest } from "@/lib/api/client";
import type { Medicine } from "@/lib/types/medicine";
import type { PharmacyListingResult } from "@/lib/types/inventoryListing";
import type { DrugInfo } from "@/lib/types/drugInfo";
import { mockMedicines } from "@/lib/mocks/medicines.mock";
import { getMockSearchResults } from "@/lib/mocks/searchResults.mock";
import { mockDrugInfo } from "@/lib/mocks/drugInfo.mock";

/** Toggle this once the Go medicines/search endpoints are live. */
const USE_MOCKS = true;

export async function searchMedicines(query: string): Promise<Medicine[]> {
  if (USE_MOCKS) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return mockMedicines.filter(
      (m) =>
        m.genericName.toLowerCase().includes(q) ||
        m.brandNames.some((b) => b.toLowerCase().includes(q))
    );
  }
  return apiRequest<Medicine[]>(`/medicines/search?q=${encodeURIComponent(query)}`);
}

export async function getMedicineListings(medicineId: string): Promise<PharmacyListingResult[]> {
  if (USE_MOCKS) {
    return getMockSearchResults(medicineId);
  }
  return apiRequest<PharmacyListingResult[]>(`/medicines/${medicineId}/listings`);
}

export async function getMedicineById(id: string): Promise<Medicine | null> {
  if (USE_MOCKS) {
    return mockMedicines.find((m) => m.id === id) ?? null;
  }
  try {
    return await apiRequest<Medicine>(`/medicines/${id}`);
  } catch {
    return null;
  }
}

/**
 * Resolves the "this medicine here" context card on Pharmacy Detail (Page
 * 8): the searched medicine's listing at one specific pharmacy, carried
 * over from Search Results (Page 7) via the `medicineId` query param. If
 * either side of the join is missing (e.g. stale/removed listing), returns
 * null so the caller can hide the card per PRD §6 "No medicine context".
 */
export async function getPharmacyMedicineContext(
  pharmacyId: string,
  medicineId: string
): Promise<{ listing: PharmacyListingResult; medicine: Medicine } | null> {
  const [listings, medicine] = await Promise.all([getMedicineListings(medicineId), getMedicineById(medicineId)]);
  const listing = listings.find((l) => l.pharmacyId === pharmacyId) ?? null;
  if (!listing || !medicine) return null;
  return { listing, medicine };
}

/**
 * Returns the raw entry (whatever its reviewStatus) — the caller is
 * responsible for the §6.4 gating (only render medical content when
 * reviewStatus === "approved"); this function doesn't hide "pending"
 * entries itself, so a future admin/reviewer view could still read them.
 */
export async function getDrugInfo(medicineId: string): Promise<DrugInfo | null> {
  if (USE_MOCKS) {
    return mockDrugInfo.find((d) => d.medicineId === medicineId) ?? null;
  }
  try {
    return await apiRequest<DrugInfo>(`/medicines/${medicineId}/drug-info`);
  } catch {
    return null;
  }
}
