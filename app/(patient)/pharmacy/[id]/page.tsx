import { getPharmacyById } from "@/lib/api/pharmacies";
import { getPharmacyMedicineContext } from "@/lib/api/medicines";
import { PharmacyDetailView } from "@/components/pharmacy/PharmacyDetailView";
import { PharmacyNotFound } from "@/components/pharmacy/PharmacyNotFound";

/**
 * Page 8 — Pharmacy Detail. Reached by tapping a pharmacy card on Search
 * Results (Page 7), which links here as `/pharmacy/{id}?medicineId={id}`
 * so the "this medicine here" card knows which listing to show (PRD §6.2,
 * §7.1 step 4). Public per proxy.ts, same as Search Results — living under
 * (patient) gives it the shared header/nav/footer shell for free.
 */
export default async function PharmacyDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ medicineId?: string }>;
}) {
  const { id } = await params;
  const { medicineId } = await searchParams;

  const pharmacy = await getPharmacyById(id);
  if (!pharmacy) {
    return <PharmacyNotFound />;
  }

  const listingContext = medicineId ? await getPharmacyMedicineContext(id, medicineId) : null;

  return <PharmacyDetailView pharmacy={pharmacy} listingContext={listingContext} />;
}
