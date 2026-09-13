"use client";

import { CheckCircle2, MapPin, Phone } from "lucide-react";
import type { MedicineSearchResult } from "@/lib/search-types";
import { interpolate } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import {
  directionsUrl,
  formatPrice,
  stockLabel,
  stockPillClasses,
  timeAgoLabel,
} from "@/lib/search-format";
import { cn } from "@/lib/cn";

type SearchTime = Dictionary["dashboard"]["search"]["time"];

/** One pharmacy's stock for a medicine. Pharmacy-centric: the medicine name lives on
 * the group card header, so this row leads with the pharmacy and its stock. The call
 * button appears only when the listing carries a phone (search results don't today). */
export function ListingRow({
  result,
  time,
  t,
}: {
  result: MedicineSearchResult;
  time: SearchTime;
  t: Dictionary;
}) {
  const ago = timeAgoLabel(result.last_updated_at, time);
  const updated = ago.justNow
    ? ago.label
    : interpolate(t.dashboard.search.updatedAgo, { time: ago.label });

  return (
    <li className={"flex items-start justify-between gap-4 px-4 py-4 sm:px-5"}>
      <div className={"min-w-0"}>
        <p className={"truncate text-sm font-medium text-foreground"}>
          {result.pharmacy_name}
          {result.distance_label ? (
            <span className={"font-normal text-muted-foreground"}>{" · " + result.distance_label}</span>
          ) : null}
        </p>
        <p className={"mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs"}>
          <a
            href={directionsUrl(result.lat, result.lng)}
            target={"_blank"}
            rel={"noreferrer"}
            className={"inline-flex items-center gap-1 rounded font-medium text-primary-strong hover:underline"}
          >
            <MapPin className={"size-3.5"} aria-hidden />
            {t.dashboard.search.directions}
          </a>
          {result.phone ? (
            <>
              <span className={"text-muted-foreground"} aria-hidden>
                ·
              </span>
              <a
                href={"tel:" + result.phone}
                className={"inline-flex items-center gap-1 rounded font-medium text-primary-strong hover:underline"}
                aria-label={interpolate(t.dashboard.search.nearby.callAria, {
                  name: result.pharmacy_name,
                })}
              >
                <Phone className={"size-3.5"} aria-hidden />
                {t.dashboard.search.nearby.call}
              </a>
            </>
          ) : null}
          <span className={"text-muted-foreground"} aria-hidden>
            ·
          </span>
          <span className={"text-muted-foreground"}>{updated}</span>
        </p>
      </div>
      <div className={"flex shrink-0 flex-col items-end gap-1.5"}>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
            stockPillClasses[result.stock_status],
          )}
        >
          {result.stock_status === "in_stock" && <CheckCircle2 className={"size-3.5"} aria-hidden />}
          {stockLabel(result.stock_status, t)}
        </span>
        {result.price_etb !== null ? (
          <span className={"text-sm font-semibold tabular-nums"}>
            {formatPrice(result.price_etb)}
          </span>
        ) : (
          <span className={"text-xs text-muted-foreground"}>
            {t.dashboard.search.priceNotListed}
          </span>
        )}
      </div>
    </li>
  );
}
