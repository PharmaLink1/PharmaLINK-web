"use client";

import type { MedicineGroup } from "@/lib/search-types";
import { interpolate } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Card } from "@/components/ui/card";
import { ListingRow } from "./listing-row";
import { NotifyButton } from "./notify-button";

type SearchTime = Dictionary["dashboard"]["search"]["time"];

/** One medicine and all the pharmacies that stock it. The notify-me toggle shows only
 * when every listing is out of stock — that's when a patient needs an alert. */
export function MedicineGroupCard({
  group,
  time,
  t,
  subscribed,
  notifyPending,
  notifyError,
  onToggleNotify,
}: {
  group: MedicineGroup;
  time: SearchTime;
  t: Dictionary;
  subscribed: boolean;
  notifyPending: boolean;
  notifyError?: string;
  onToggleNotify: (medicineId: string) => void;
}) {
  const title = group.matched_name || group.generic_name || group.brand_name || "";
  const count =
    group.listings.length === 1
      ? t.dashboard.search.group.pharmaciesOne
      : interpolate(t.dashboard.search.group.pharmaciesOther, { count: group.listings.length });

  return (
    <Card className={"overflow-hidden"}>
      <div className={"flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5"}>
        <div className={"min-w-0"}>
          <h3 className={"font-semibold tracking-tight"}>
            {title}
            {group.dosage_form ? (
              <span className={"font-normal text-muted-foreground"}>{" · " + group.dosage_form}</span>
            ) : null}
          </h3>
          <p className={"mt-0.5 text-xs text-muted-foreground"}>{count}</p>
        </div>
        {group.all_out_of_stock ? (
          <div className={"shrink-0"}>
            <NotifyButton
              subscribed={subscribed}
              pending={notifyPending}
              error={notifyError}
              onToggle={() => onToggleNotify(group.medicine_id)}
              t={t}
            />
          </div>
        ) : null}
      </div>
      <ul className={"divide-y divide-border border-t border-border"}>
        {group.listings.map((listing) => (
          <ListingRow key={listing.listing_id} result={listing} time={time} t={t} />
        ))}
      </ul>
    </Card>
  );
}
