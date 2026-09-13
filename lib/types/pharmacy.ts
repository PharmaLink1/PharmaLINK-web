export type VerifiedStatus = "pending" | "verified" | "rejected";

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  hours: string;
  ownerId: string;
  verifiedStatus: VerifiedStatus;
  /** Derived client-side from the patient's location, not stored on the entity. */
  distanceKm?: number;
  isOpenNow?: boolean;
}
