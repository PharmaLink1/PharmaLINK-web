"use client";

import Link from "next/link";
import { Phone } from "lucide-react";
import type { NearbyPharmacy } from "@/lib/search-types";
import { interpolate } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { formatDistanceMeters } from "@/lib/search-format";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

/** The fallback list of pharmacies to call when a search finds no stock. These carry
 * a phone number, so the call button is the point. */
export function NearbyList({ pharmacies, t }: { pharmacies: NearbyPharmacy[]; t: Dictionary }) {
  return (
    <Card className={"overflow-hidden"}>
      <ul className={"divide-y divide-border"}>
        {pharmacies.map((pharmacy) => (
          <li
            key={pharmacy.pharmacy_id}
            className={"flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5"}
          >
            <div className={"min-w-0"}>
              <p className={"truncate text-sm font-medium text-foreground"}>
                <Link
                  href={"/dashboard/pharmacies/" + pharmacy.pharmacy_id}
                  className={"rounded hover:underline"}
                >
                  {pharmacy.pharmacy_name}
                </Link>
              </p>
              <p className={"mt-0.5 text-xs text-muted-foreground"}>
                {formatDistanceMeters(pharmacy.distance_m)}
              </p>
            </div>
            {pharmacy.phone ? (
              <a
                href={"tel:" + pharmacy.phone}
                className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "shrink-0")}
                aria-label={interpolate(t.dashboard.search.nearby.callAria, {
                  name: pharmacy.pharmacy_name,
                })}
              >
                <Phone className={"size-4"} aria-hidden />
                {t.dashboard.search.nearby.call}
              </a>
            ) : (
              <span className={"shrink-0 text-xs text-muted-foreground"}>
                {t.dashboard.search.nearby.noPhone}
              </span>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
