"use client";

import Link from "next/link";
import type { Pharmacy } from "@/lib/types/pharmacy";
import type { PharmacyListingResult } from "@/lib/types/inventoryListing";
import type { Medicine } from "@/lib/types/medicine";
import { BackArrowIcon, DirectionsIcon, PhoneIcon, VerifiedBadgeIcon } from "@/components/ui/icons";
import { parseHoursRange } from "@/lib/utils/hours";
import { MedicineHereCard } from "@/components/pharmacy/MedicineHereCard";
import { ContactHoursCard } from "@/components/pharmacy/ContactHoursCard";
import { MapPreviewCard } from "@/components/pharmacy/MapPreviewCard";
import { useTranslation } from "@/lib/i18n/useTranslation";

/** Real Google Maps deep link — opens the phone's default maps app per prd.md §6.2. */
function directionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/**
 * Page 8 — Pharmacy Detail. Extracted from the Figma frame (node 6:747):
 * back link, pharmacy header (name + Verified badge + open/closed meta),
 * the two primary actions, the "this medicine here" listing card (only
 * when a medicine came along from Search Results), Contact & Hours, and a
 * light map preview. Lives under the (patient) route group, which already
 * supplies the shared header/nav/footer shell (PatientTopNav/BottomNav +
 * PublicFooter) — same pattern as Search Results (Page 7).
 */
export function PharmacyDetailView({
  pharmacy,
  listingContext,
}: {
  pharmacy: Pharmacy;
  listingContext: { listing: PharmacyListingResult; medicine: Medicine } | null;
}) {
  const { t } = useTranslation();
  const hoursRange = parseHoursRange(pharmacy.hours);
  const backHref = listingContext
    ? `/search?q=${encodeURIComponent(listingContext.medicine.genericName)}`
    : "/search";

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
      >
        <BackArrowIcon />
        {t.pharmacyDetail.backToResults}
      </Link>

      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[26px] leading-8 font-bold text-[var(--color-text-primary)]">{pharmacy.name}</h1>
          {pharmacy.verifiedStatus === "verified" && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-stock-in-border)] bg-[var(--color-stock-in-bg)] px-[11px] py-[5px] text-xs font-medium text-[var(--color-brand)]">
              <VerifiedBadgeIcon />
              {t.pharmacyDetail.verifiedPharmacy}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-base">
          <span className="inline-flex items-center gap-1.5 font-medium text-[var(--color-brand)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-brand)]" aria-hidden="true" />
            {pharmacy.isOpenNow ? t.search.openNow : t.search.closed}
          </span>
          {hoursRange && (
            <>
              <span className="text-[var(--color-border)]" aria-hidden="true">
                |
              </span>
              <span className="text-[var(--color-text-secondary)]">
                {pharmacy.isOpenNow
                  ? `${t.pharmacyDetail.closes} ${hoursRange.closes}`
                  : `${t.pharmacyDetail.opens} ${hoursRange.opens}`}
              </span>
            </>
          )}
          {pharmacy.distanceKm != null && (
            <>
              <span className="text-[var(--color-border)]" aria-hidden="true">
                |
              </span>
              <span className="text-[var(--color-text-secondary)]">
                {pharmacy.distanceKm} {t.pharmacyDetail.kmAway}
              </span>
            </>
          )}
        </div>
      </header>

      <div className="flex flex-col gap-4 sm:flex-row">
        <a
          href={directionsUrl(pharmacy.lat, pharmacy.lng)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-brand)] px-4 text-base font-semibold text-white transition-colors hover:bg-[var(--color-brand-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]/40"
        >
          <DirectionsIcon />
          {t.pharmacyDetail.getDirections}
        </a>
        {pharmacy.phone && (
          <a
            href={`tel:${pharmacy.phone}`}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-[var(--radius-button)] border-2 border-[var(--color-brand)] px-4 text-base font-semibold text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand)]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]/40"
          >
            <PhoneIcon />
            {t.pharmacyDetail.callPharmacy}
          </a>
        )}
      </div>

      {listingContext && <MedicineHereCard listing={listingContext.listing} medicine={listingContext.medicine} />}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <ContactHoursCard pharmacy={pharmacy} />
        <MapPreviewCard lat={pharmacy.lat} lng={pharmacy.lng} />
      </div>
    </div>
  );
}
