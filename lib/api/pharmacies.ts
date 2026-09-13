import { apiRequest } from "@/lib/api/client";
import type { Pharmacy } from "@/lib/types/pharmacy";
import { mockPharmacies } from "@/lib/mocks/pharmacies.mock";

const USE_MOCKS = true;

export async function getPharmacyById(id: string): Promise<Pharmacy | null> {
  if (USE_MOCKS) {
    return mockPharmacies.find((p) => p.id === id) ?? null;
  }
  try {
    return await apiRequest<Pharmacy>(`/pharmacies/${id}`);
  } catch {
    return null;
  }
}

export async function getNearbyPharmacies(lat: number, lng: number): Promise<Pharmacy[]> {
  if (USE_MOCKS) {
    return mockPharmacies;
  }
  return apiRequest<Pharmacy[]>(`/pharmacies/nearby?lat=${lat}&lng=${lng}`);
}
