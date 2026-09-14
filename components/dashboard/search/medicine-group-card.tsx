"use client";

import * as React from "react";
import { ChevronDown, Pill } from "lucide-react";
import type { MedicineGroup } from "@/lib/search-types";
import { interpolate } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { DrugInfoPanel } from "./drug-info-panel";
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
  const di = t.dashboard.drugInfo;
  const [infoOpen, setInfoOpen] = React.useState(false);
  const panelId = "drug-info-" + group.medicine_id;

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
      <div className={"border-t border-border"}>
        <button
          type={"button"}
          onClick={() => setInfoOpen((open) => !open)}
          aria-expanded={infoOpen}
          aria-controls={panelId}
          className={"flex w-full items-center justify-between gap-2 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:px-5"}
        >
          <span className={"inline-flex items-center gap-2"}>
            <Pill className={"size-4 text-primary-strong"} aria-hidden />
            {infoOpen ? di.hide : di.open}
          </span>
          <ChevronDown
            className={cn("size-4 text-muted-foreground transition-transform", infoOpen && "rotate-180")}
            aria-hidden
          />
        </button>
        {infoOpen && (
          <div id={panelId} className={"border-t border-border"}>
            <DrugInfoPanel medicineId={group.medicine_id} t={t} />
          </div>
        )}
      </div>
    </Card>
  );
}
