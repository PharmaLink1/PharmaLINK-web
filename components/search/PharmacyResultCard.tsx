"use client";

import { useRouter } from "next/navigation";
import type { PharmacyListingResult } from "@/lib/types/inventoryListing";
import { Badge } from "@/components/ui/Badge";
import { DirectionsIcon, LocationPinIcon } from "@/components/ui/icons";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { formatUpdatedAt } from "@/lib/utils/time";

/** Real Google Maps deep link — opens the phone's default maps app per
 * main prd.md §6.2, rather than a placeholder/dead "Directions" button. */
function directionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/**
 * Locked, reused listing card — extracted from Page 7's actual Figma frame
 * (node 6:519): name + distance/open-closed row, stock badge + freshness
 * row, and a right column with price + a real "Directions" link. Cards for
 * pharmacies that are closed or out of stock are visually dimmed, matching
 * the Figma's own opacity treatment on those exact cards.
 *
 * The whole card is tappable → Pharmacy Detail (Page 8), per PRD §7.1 step
 * 4 ("tap a pharmacy result card"), not just the pharmacy's name — so
 * there's no small/ambiguous target to hunt for. "Get directions" is a
 * real nested action (opens Google Maps in a new tab) and stops the click
 * from also bubbling into the card's own navigation.
 */
export function PharmacyResultCard({ listing }: { listing: PharmacyListingResult }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { pharmacy } = listing;

  const isFullyAvailable = listing.stockStatus === "in_stock" && pharmacy.isOpenNow;
  const isOutOfStock = listing.stockStatus === "out_of_stock";
  const cardOpacity = isOutOfStock ? "opacity-60" : !pharmacy.isOpenNow ? "opacity-80" : "";

  const directionsClasses = isFullyAvailable
    ? "bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-hover)]"
    : isOutOfStock
      ? "border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-text-secondary)]"
      : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-canvas)]";

  const detailHref = `/pharmacy/${pharmacy.id}?medicineId=${listing.medicineId}`;

  function goToDetail() {
    router.push(detailHref);
  }

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={goToDetail}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goToDetail();
        }
      }}
      className={`flex cursor-pointer items-start justify-between gap-4 rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-5 transition-colors hover:border-[var(--color-brand)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]/40 sm:px-[41px] sm:py-[21px] ${cardOpacity}`}
    >
      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold text-[var(--color-text-primary)]">{pharmacy.name}</p>

        <div className="flex items-center gap-2 text-[13px]">
          {pharmacy.distanceKm != null ? (
            <span className="inline-flex items-center gap-1 text-[var(--color-text-secondary)]">
              <LocationPinIcon />
              {pharmacy.distanceKm} km
            </span>
          ) : (
            <span className="text-[var(--color-text-secondary)]">{t.search.distanceUnknown}</span>
          )}
          <span className="h-1 w-1 rounded-full bg-[var(--color-text-placeholder)]" aria-hidden="true" />
          <span className={`font-medium ${pharmacy.isOpenNow ? "text-[var(--color-stock-in)]" : "text-[var(--color-error)]"}`}>
            {pharmacy.isOpenNow ? t.search.openNow : t.search.closed}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge status={listing.stockStatus} />
          <span className="text-xs text-[var(--color-text-placeholder)] italic">
            {t.search.updated} {formatUpdatedAt(listing.updatedAt)}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end justify-center gap-3">
        {listing.price != null ? (
          <p className="text-xl font-bold text-[var(--color-text-primary)]">
            {listing.price} {listing.currency}
          </p>
        ) : (
          <p className="text-base text-[var(--color-text-secondary)] italic">{t.search.priceNotListed}</p>
        )}

        <a
          href={directionsUrl(pharmacy.lat, pharmacy.lng)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={`inline-flex items-center gap-2 rounded-[8px] px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]/40 ${directionsClasses}`}
        >
          {t.search.directionsButton}
          <DirectionsIcon />
        </a>
      </div>
    </div>
  );
}
