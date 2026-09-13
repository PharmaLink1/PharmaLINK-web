"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import type { InventoryListing, StockStatusValue } from "@/lib/pharmacy-types";
import { interpolate } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { formatPrice, stockLabel, stockPillClasses, timeAgoLabel } from "@/lib/search-format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/** One inventory row: the medicine, its stock pill, price, freshness, and a remove
 * action. Stock styling is shared with patient search so the pharmacist sees exactly
 * what patients will. */
export function ListingRow({
  listing,
  name,
  removing,
  onRemove,
  t,
}: {
  listing: InventoryListing;
  name: string;
  removing: boolean;
  onRemove: (medicineID: string) => void;
  t: Dictionary;
}) {
  const row = t.dashboard.inventory.row;
  const ago = timeAgoLabel(listing.updated_at, t.dashboard.search.time);
  const updated = ago.justNow ? ago.label : interpolate(row.updated, { time: ago.label });

  return (
    <li className={"flex items-start justify-between gap-4 px-4 py-4 sm:px-5"}>
      <div className={"min-w-0"}>
        <p className={"truncate text-sm font-medium text-foreground"}>{name}</p>
        <p className={"mt-1 text-xs text-muted-foreground"}>{updated}</p>
        <div className={"mt-2"}>
          <Button
            type={"button"}
            variant={"ghost"}
            size={"sm"}
            loading={removing}
            onClick={() => onRemove(listing.medicine_id)}
            aria-label={interpolate(row.removeAria, { name })}
            className={"text-danger hover:bg-danger-subtle"}
          >
            {!removing && <Trash2 className={"size-4"} aria-hidden />}
            {removing ? row.removing : row.remove}
          </Button>
        </div>
      </div>
      <div className={"flex shrink-0 flex-col items-end gap-1.5"}>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
            stockPillClasses[listing.stock_status as StockStatusValue],
          )}
        >
          {stockLabel(listing.stock_status as StockStatusValue, t)}
        </span>
        {listing.price !== null ? (
          <span className={"text-sm font-semibold tabular-nums"}>{formatPrice(listing.price)}</span>
        ) : (
          <span className={"text-xs text-muted-foreground"}>{row.noPrice}</span>
        )}
      </div>
    </li>
  );
}
