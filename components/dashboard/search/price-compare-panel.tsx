"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpDown, LocateFixed, MapPin, Store } from "lucide-react";
import { priceApi } from "@/lib/api-client";
import type { PriceComparisonItem, PriceSort } from "@/lib/price-types";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { interpolate } from "@/lib/i18n";
import { getErrorMessage } from "@/lib/i18n/errors";
import { formatDistanceMeters, formatPrice, timeAgoLabel } from "@/lib/search-format";
import { Alert } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { cn } from "@/lib/cn";

export type PriceCompareLocation = { lat: number; lng: number };

type Phase = "loading" | "success" | "error";

/** What nearby verified pharmacies charge for one medicine. It lives inside the
 * medicine card and loads on first open: a search can match many medicines and most
 * are never compared, so paying for every comparison up front would waste bandwidth. */
export function PriceComparePanel({
  medicineId,
  location,
  ensureLocation,
  t,
}: {
  medicineId: string;
  location: PriceCompareLocation | null;
  ensureLocation: () => Promise<PriceCompareLocation | null>;
  t: Dictionary;
}) {
  const compare = t.dashboard.search.compare;

  const [phase, setPhase] = React.useState<Phase>("loading");
  const [items, setItems] = React.useState<PriceComparisonItem[]>([]);
  const [error, setError] = React.useState("");
  const [sort, setSort] = React.useState<PriceSort>("price_asc");
  const [attempt, setAttempt] = React.useState(0);
  const [locating, setLocating] = React.useState(false);

  // A slow response from an earlier sort must not overwrite the current one.
  const seqRef = React.useRef(0);

  React.useEffect(() => {
    if (!location) return;
    const seq = ++seqRef.current;
    queueMicrotask(() => {
      if (seqRef.current !== seq) return;
      setPhase("loading");
      setError("");
    });
    priceApi
      .compare(medicineId, { lat: location.lat, lng: location.lng, sort })
      .then((data) => {
        if (seqRef.current !== seq) return;
        setItems(data);
        setPhase("success");
      })
      .catch((err) => {
        if (seqRef.current !== seq) return;
        setError(getErrorMessage(err, t));
        setPhase("error");
      });
  }, [medicineId, location, sort, attempt, t]);

  async function handleUseLocation() {
    if (locating) return;
    setLocating(true);
    await ensureLocation();
    setLocating(false);
  }

  if (!location) {
    return (
      <div className={"space-y-3 px-4 py-4 sm:px-5"}>
        <p className={"text-sm text-muted-foreground"}>{compare.needLocation}</p>
        <Button
          type={"button"}
          variant={"outline"}
          size={"sm"}
          loading={locating}
          onClick={() => void handleUseLocation()}
        >
          {!locating && <LocateFixed className={"size-4"} aria-hidden />}
          {t.dashboard.search.location.use}
        </Button>
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className={"space-y-3 px-4 py-4 sm:px-5"} aria-busy={"true"}>
        <span className={"sr-only"}>{compare.loading}</span>
        {[0, 1, 2].map((row) => (
          <div key={row} className={"animate-pulse"}>
            <div className={"h-3.5 w-2/5 rounded bg-muted"} />
            <div className={"mt-2 h-3 w-1/3 rounded bg-muted"} />
          </div>
        ))}
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className={"px-4 py-4 sm:px-5"}>
        <Alert variant={"danger"}>
          <div className={"flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"}>
            <span>{error}</span>
            <Button
              type={"button"}
              variant={"outline"}
              size={"sm"}
              onClick={() => setAttempt((n) => n + 1)}
            >
              {t.dashboard.search.retry}
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={"space-y-2 px-4 py-4 sm:px-5"}>
        <p className={"text-sm font-medium text-foreground"}>{compare.empty.title}</p>
        <p className={"text-sm text-muted-foreground"}>{compare.empty.body}</p>
        <Link
          href={"/dashboard/pharmacies"}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-1")}
        >
          <Store className={"size-4"} aria-hidden />
          {compare.empty.action}
        </Link>
      </div>
    );
  }

  // Only worth calling out a winner when there is more than one price to win against.
  const prices = items
    .filter((item) => item.price_listed && item.price_etb !== null)
    .map((item) => item.price_etb as number);
  const cheapest = prices.length > 1 ? Math.min(...prices) : null;

  return (
    <div className={"space-y-3 px-4 py-4 sm:px-5"}>
      <div className={"flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"}>
        <p className={"text-xs text-muted-foreground"}>
          {items.length === 1
            ? t.dashboard.search.group.pharmaciesOne
            : interpolate(t.dashboard.search.group.pharmaciesOther, { count: items.length })}
        </p>
        <div className={"sm:w-72"}>
          <SegmentedControl<PriceSort>
            ariaLabel={compare.sortLabel}
            value={sort}
            onChange={setSort}
            options={[
              { value: "price_asc", label: compare.sortPrice, icon: ArrowUpDown },
              { value: "distance", label: compare.sortDistance, icon: MapPin },
            ]}
          />
        </div>
      </div>

      <ul className={"divide-y divide-border"}>
        {items.map((item) => (
          <CompareRow key={item.pharmacy_id} item={item} cheapest={cheapest} t={t} />
        ))}
      </ul>

      <p className={"text-xs text-muted-foreground"}>{compare.note}</p>
    </div>
  );
}

/** One pharmacy's price. The pharmacy name links to its detail page, as in the search
 * listing rows. No stock badge: this endpoint does not return a stock status. */
function CompareRow({
  item,
  cheapest,
  t,
}: {
  item: PriceComparisonItem;
  cheapest: number | null;
  t: Dictionary;
}) {
  const compare = t.dashboard.search.compare;
  const ago = timeAgoLabel(item.last_updated_at, t.dashboard.search.time);
  const updated = ago.justNow
    ? ago.label
    : interpolate(t.dashboard.search.updatedAgo, { time: ago.label });
  const best = cheapest !== null && item.price_listed && item.price_etb === cheapest;

  return (
    <li className={"flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6"}>
      <div className={"min-w-0"}>
        <p className={"truncate text-sm font-medium text-foreground"}>
          <Link
            href={"/dashboard/pharmacies/" + item.pharmacy_id}
            className={"rounded hover:underline"}
          >
            {item.pharmacy_name}
          </Link>
        </p>
        <p className={"mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground"}>
          <span className={"inline-flex items-center gap-1"}>
            <MapPin className={"size-3.5"} aria-hidden />
            {formatDistanceMeters(item.distance_m)}
          </span>
          <span aria-hidden>·</span>
          <span>{updated}</span>
        </p>
      </div>
      <div className={"flex shrink-0 flex-col items-end gap-1.5"}>
        {best && (
          <span className={"inline-flex items-center rounded-full bg-primary-subtle px-2 py-0.5 text-[10px] font-medium text-primary-strong"}>
            {compare.bestPrice}
          </span>
        )}
        {item.price_listed && item.price_etb !== null ? (
          <span className={"text-sm font-semibold tabular-nums"}>
            {formatPrice(item.price_etb)}
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
