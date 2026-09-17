"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
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
    <li className={"grid min-w-0 grid-cols-1 gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.6fr)] sm:gap-x-6 sm:px-5"}>
      <div className={"min-w-0"}>
        <Link
          href={"/dashboard/pharmacies/" + result.pharmacy_id}
          className={"inline-flex min-h-11 min-w-11 max-w-full items-center rounded py-2 text-base font-semibold leading-relaxed text-foreground hover:text-primary-strong hover:underline"}
        >
          <span className={"min-w-0 break-words"}>{result.pharmacy_name}</span>
        </Link>
        {result.distance_label ? (
          <p className={"break-words text-sm leading-relaxed text-muted-foreground"}>
            {result.distance_label}
          </p>
        ) : null}
        <p className={"mt-1 break-words text-sm leading-relaxed text-muted-foreground"}>{updated}</p>
      </div>
      <div className={"flex min-w-0 flex-col items-start gap-2 sm:items-end sm:text-right"}>
        <span
          className={cn(
            "inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium leading-relaxed",
            stockPillClasses[result.stock_status],
          )}
        >
          {result.stock_status === "in_stock" && <CheckCircle2 className={"size-3.5 shrink-0"} aria-hidden />}
          <span className={"min-w-0 break-words"}>{stockLabel(result.stock_status, t)}</span>
        </span>
        {result.price_etb !== null ? (
          <span className={"max-w-full break-words text-xl font-semibold leading-snug tracking-tight text-foreground tabular-nums"}>
            {formatPrice(result.price_etb)}
          </span>
        ) : (
          <span className={"max-w-full break-words text-sm leading-relaxed text-muted-foreground"}>
            {t.dashboard.search.priceNotListed}
          </span>
        )}
      </div>
      <div className={"flex min-w-0 flex-col gap-2 sm:col-span-2 sm:flex-row sm:flex-wrap"}>
        <a
          href={directionsUrl(result.lat, result.lng)}
          target={"_blank"}
          rel={"noreferrer"}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-auto min-h-11 min-w-11 max-w-full whitespace-normal py-2.5 text-primary-strong",
          )}
        >
          <MapPin className={"size-4"} aria-hidden />
          <span className={"min-w-0 break-words"}>{t.dashboard.search.directions}</span>
        </a>
        {result.phone ? (
          <a
            href={"tel:" + result.phone}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-auto min-h-11 min-w-11 max-w-full whitespace-normal py-2.5 text-primary-strong",
            )}
            aria-label={interpolate(t.dashboard.search.nearby.callAria, {
              name: result.pharmacy_name,
            })}
          >
            <Phone className={"size-4"} aria-hidden />
            <span className={"min-w-0 break-words"}>{t.dashboard.search.nearby.call}</span>
          </a>
        ) : null}
      </div>
    </li>
  );
}
