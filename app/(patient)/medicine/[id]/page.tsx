import { getDrugInfo, getMedicineById } from "@/lib/api/medicines";
import { DrugInfoView } from "@/components/drugInfo/DrugInfoView";
import { MedicineNotFound } from "@/components/drugInfo/MedicineNotFound";

/**
 * Page 9 — Drug Info. Reached from "Drug info" (Search Results) or "View
 * drug info" (Pharmacy Detail), carrying the medicine's id. Public per
 * proxy.ts, same reasoning as Search/Pharmacy Detail — living under
 * (patient) gives it the shared header/nav/footer shell for free.
 */
export default async function DrugInfoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [medicine, drugInfo] = await Promise.all([getMedicineById(id), getDrugInfo(id)]);

  if (!medicine) {
    return <MedicineNotFound />;
  }

  return <DrugInfoView medicine={medicine} drugInfo={drugInfo} />;
}
