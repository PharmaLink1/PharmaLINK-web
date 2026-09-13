// Groups the backend's flat per-listing search results into one entry per medicine,
// so the UI can show a medicine card with its pharmacy listings nested.

import type { MedicineGroup, MedicineSearchResult } from "./search-types";

/**
 * Group results by medicine_id, preserving the backend's rank order.
 *
 * A medicine takes the position of its first-seen listing and keeps it even as later
 * pages (via "show more") append more of its listings; genuinely new medicines append
 * at the end. Header fields (name/strength/dosage_form) come from the first listing.
 * Runs over the full accumulated results array, so it is safe to re-run on every page.
 */
export function groupByMedicine(results: MedicineSearchResult[]): MedicineGroup[] {
  const order: MedicineGroup[] = [];
  const byId = new Map<string, MedicineGroup>();

  for (const r of results) {
    let group = byId.get(r.medicine_id);
    if (!group) {
      group = {
        medicine_id: r.medicine_id,
        matched_name: r.matched_name,
        generic_name: r.generic_name,
        brand_name: r.brand_name,
        amharic_name: r.amharic_name,
        dosage_form: r.dosage_form,
        strength: r.strength,
        all_out_of_stock: true,
        listings: [],
      };
      byId.set(r.medicine_id, group);
      order.push(group);
    }
    group.listings.push(r);
    if (r.stock_status !== "out_of_stock") group.all_out_of_stock = false;
  }

  return order;
}
