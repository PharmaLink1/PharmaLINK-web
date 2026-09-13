"use client";

import * as React from "react";
import { PackageX } from "lucide-react";
import type { InventoryListing, StockStatusValue } from "@/lib/pharmacy-types";
import { interpolate } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { formatPrice, stockLabel, stockPillClasses, timeAgoLabel } from "@/lib/search-format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/** One inventory row: the medicine, its stock pill, price, freshness, and a "mark out
 * of stock" action (the API has no delete — a pharmacy retires a listing by marking it
 * out of stock). Stock styling is shared with patient search so the pharmacist sees
 * exactly what patients will. */
export function ListingRow({
  listing,
  name,
  marking,
  onMarkOutOfStock,
  t,
}: {
  listing: InventoryListing;
  name: string;
  marking: boolean;
  onMarkOutOfStock: (medicineID: string) => void;
  t: Dictionary;
}) {
  const row = t.dashboard.inventory.row;
  const ago = timeAgoLabel(listing.updatedAt, t.dashboard.search.time);
  const updated = ago.justNow ? ago.label : interpolate(row.updated, { time: ago.label });

  return (
    <li className={"flex items-start justify-between gap-4 px-4 py-4 sm:px-5"}>
      <div className={"min-w-0"}>
        <p className={"truncate text-sm font-medium text-foreground"}>{name}</p>
        <p className={"mt-1 text-xs text-muted-foreground"}>{updated}</p>
        {listing.stockStatus !== "out_of_stock" && (
          <div className={"mt-2"}>
            <Button
              type={"button"}
              variant={"ghost"}
              size={"sm"}
              loading={marking}
              onClick={() => onMarkOutOfStock(listing.medicineId)}
              aria-label={interpolate(row.markOutOfStockAria, { name })}
              className={"text-muted-foreground hover:text-foreground"}
            >
              {!marking && <PackageX className={"size-4"} aria-hidden />}
              {marking ? row.marking : row.markOutOfStock}
            </Button>
          </div>
        )}
      </div>
      <div className={"flex shrink-0 flex-col items-end gap-1.5"}>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
            stockPillClasses[listing.stockStatus as StockStatusValue],
          )}
        >
          {stockLabel(listing.stockStatus as StockStatusValue, t)}
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
