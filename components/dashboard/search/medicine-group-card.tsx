"use client";

import * as React from "react";
import { ArrowUpDown, ChevronDown, Pill } from "lucide-react";
import type { MedicineGroup } from "@/lib/search-types";
import { interpolate } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { DrugInfoPanel } from "./drug-info-panel";
import { ListingRow } from "./listing-row";
import { NotifyButton } from "./notify-button";
import { PriceComparePanel, type PriceCompareLocation } from "./price-compare-panel";

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
  location,
  ensureLocation,
}: {
  group: MedicineGroup;
  time: SearchTime;
  t: Dictionary;
  subscribed: boolean;
  notifyPending: boolean;
  notifyError?: string;
  onToggleNotify: (medicineId: string) => void;
  location: PriceCompareLocation | null;
  ensureLocation: () => Promise<PriceCompareLocation | null>;
}) {
  const di = t.dashboard.drugInfo;
  const [infoOpen, setInfoOpen] = React.useState(false);
  const [compareOpen, setCompareOpen] = React.useState(false);
  const panelId = "drug-info-" + group.medicine_id;
  const comparePanelId = "price-compare-" + group.medicine_id;

  const title = group.matched_name || group.generic_name || group.brand_name || "";
  const count =
    group.listings.length === 1
      ? t.dashboard.search.group.pharmaciesOne
      : interpolate(t.dashboard.search.group.pharmaciesOther, { count: group.listings.length });

  return (
    <Card className={"overflow-hidden [&_button]:h-auto [&_button]:min-h-11 [&_button]:whitespace-normal [&_button]:py-2.5"}>
      <div className={"space-y-4 px-4 py-5 sm:px-5"}>
        <div className={"flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"}>
          <div className={"min-w-0 flex-1"}>
            <h3 className={"break-words text-xl font-semibold leading-snug tracking-tight text-foreground sm:text-2xl"}>
              {title}
            </h3>
            <p className={"mt-1 flex flex-wrap gap-x-2 gap-y-1 text-sm leading-relaxed text-muted-foreground"}>
              {group.dosage_form ? (
                <>
                  <span className={"min-w-0 break-words"}>{group.dosage_form}</span>
                  <span aria-hidden>·</span>
                </>
              ) : null}
              <span>{count}</span>
            </p>
          </div>
          {group.all_out_of_stock ? (
            <div className={"min-w-0 break-words lg:max-w-xs [&_button]:max-w-full"}>
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
        <div className={"grid grid-cols-1 gap-3 sm:grid-cols-2"}>
          <Button
            type={"button"}
            variant={"primary"}
            onClick={() => setCompareOpen((open) => !open)}
            aria-expanded={compareOpen}
            aria-controls={comparePanelId}
            className={"min-w-0 justify-between gap-3 text-left leading-relaxed"}
          >
            <span className={"inline-flex min-w-0 items-center gap-2"}>
              <ArrowUpDown className={"size-4"} aria-hidden />
              <span className={"min-w-0 break-words"}>
                {compareOpen ? t.dashboard.search.compare.hide : t.dashboard.search.compare.label}
              </span>
            </span>
            <ChevronDown className={cn("size-4", compareOpen && "rotate-180")} aria-hidden />
          </Button>
          <Button
            type={"button"}
            variant={"outline"}
            onClick={() => setInfoOpen((open) => !open)}
            aria-expanded={infoOpen}
            aria-controls={panelId}
            className={cn(
              "min-w-0 justify-between gap-3 border-primary-strong/40 text-left leading-relaxed text-primary-strong hover:bg-primary-subtle",
              infoOpen && "bg-primary-subtle",
            )}
          >
            <span className={"inline-flex min-w-0 items-center gap-2"}>
              <Pill className={"size-4"} aria-hidden />
              <span className={"min-w-0 break-words"}>{infoOpen ? di.hide : di.open}</span>
            </span>
            <ChevronDown className={cn("size-4", infoOpen && "rotate-180")} aria-hidden />
          </Button>
        </div>
      </div>
      {compareOpen && (
        <div id={comparePanelId} className={"border-t border-border"}>
          <PriceComparePanel
            medicineId={group.medicine_id}
            location={location}
            ensureLocation={ensureLocation}
            t={t}
          />
        </div>
      )}
      {infoOpen && (
        <div id={panelId} className={"border-t border-border"}>
          <DrugInfoPanel medicineId={group.medicine_id} t={t} />
        </div>
      )}
      <ul className={"divide-y divide-border border-t border-border"}>
        {group.listings.map((listing) => (
          <ListingRow key={listing.listing_id} result={listing} time={time} t={t} />
        ))}
      </ul>
    </Card>
  );
}
