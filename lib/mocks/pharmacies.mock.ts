import type { Pharmacy } from "@/lib/types/pharmacy";

/**
 * Names, ids, lat/lng, distance and open state are kept in sync with
 * lib/mocks/searchResults.mock.ts's five pharmacy join rows — Search
 * Results (Page 7) links each result card straight to
 * `/pharmacy/{pharmacyId}` (Page 8), so both mocks must describe the same
 * five pharmacies rather than diverging placeholder data.
 */
export const mockPharmacies: Pharmacy[] = [
  {
    id: "pharm_1",
    name: "Bole Medico Pharmacy",
    address: "Bole Road, near Friendship Center, Addis Ababa",
    lat: 8.9931,
    lng: 38.7892,
    phone: "+251911234567",
    hours: "08:00 - 21:00",
    ownerId: "owner_1",
    verifiedStatus: "verified",
    distanceKm: 0.8,
    isOpenNow: true,
  },
  {
    id: "pharm_2",
    name: "Unity Health Pharmacy",
    address: "Kazanchis, near Getu Commercial Center, Addis Ababa",
    lat: 9.0129,
    lng: 38.7614,
    phone: "+251911000002",
    hours: "07:00 - 22:00",
    ownerId: "owner_2",
    verifiedStatus: "verified",
    distanceKm: 1.2,
    isOpenNow: true,
  },
  {
    id: "pharm_3",
    name: "Sunshine Pharmacy",
    address: "Megenagna, near Zefmesh Grand Mall, Addis Ababa",
    lat: 9.0198,
    lng: 38.8017,
    phone: "+251911000003",
    hours: "08:00 - 20:00",
    ownerId: "owner_3",
    verifiedStatus: "verified",
    distanceKm: 1.5,
    isOpenNow: true,
  },
  {
    id: "pharm_4",
    name: "Central Care Pharmacy",
    address: "Piassa, near De Gaulle Square, Addis Ababa",
    lat: 9.005,
    lng: 38.76,
    phone: "+251911000004",
    hours: "08:00 - 19:00",
    ownerId: "owner_4",
    verifiedStatus: "verified",
    distanceKm: 2.1,
    isOpenNow: false,
  },
  {
    id: "pharm_5",
    name: "Ethio Pharmacy",
    address: "Sarbet, near Bethel Hospital, Addis Ababa",
    lat: 9.021,
    lng: 38.79,
    phone: "+251911000005",
    hours: "07:30 - 21:30",
    ownerId: "owner_5",
    verifiedStatus: "verified",
    distanceKm: 2.5,
    isOpenNow: true,
  },
];
