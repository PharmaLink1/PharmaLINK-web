"use client";

import Link from "next/link";
import type { PharmacyListingResult } from "@/lib/types/inventoryListing";
import type { Medicine } from "@/lib/types/medicine";
import { Badge } from "@/components/ui/Badge";
import { ChevronRightIcon, PrescriptionIcon } from "@/components/ui/icons";
import { formatUpdatedAt } from "@/lib/utils/time";
import { useTranslation } from "@/lib/i18n/useTranslation";

/**
 * "Available at this pharmacy" listing card — extracted from Page 8's
 * Figma frame (node 6:781). Shown only when the patient arrived with a
 * searched medicine in context (via `?medicineId=` from Search Results);
 * hidden entirely otherwise per PRD §6 "No medicine context". Displays
 * the medicine by `generic_name` only — §8 Medicine has no strength/form
 * field, a data-model gap already flagged on Pages 4 & 7 and again here.
 */
export function MedicineHereCard({ listing, medicine }: { listing: PharmacyListingResult; medicine: Medicine }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-[25px]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col items-start gap-2">
          <p className="text-xs font-medium tracking-[0.06em] text-[var(--color-text-secondary)] uppercase">
            {t.pharmacyDetail.availableHeading}
          </p>
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">{medicine.genericName}</h2>
          {medicine.requiresPrescription && (
            <span className="inline-flex items-center gap-1 rounded-[4px] border border-[var(--color-border)] px-[9px] py-[3px] text-xs font-medium text-[var(--color-text-secondary)]">
              <PrescriptionIcon />
              {t.drugInfo.prescriptionNeeded}
            </span>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <Badge status={listing.stockStatus} />
          <p className="text-xs text-[var(--color-text-placeholder)]">
            {t.search.updated} {formatUpdatedAt(listing.updatedAt)}
          </p>
        </div>
      </div>

      <div className="flex items-end justify-between gap-4 border-t border-[var(--color-border)] pt-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-[var(--color-text-secondary)]">{t.pharmacyDetail.priceLabel}</p>
          {listing.price != null ? (
            <p className="text-[26px] leading-8 font-bold text-[var(--color-text-primary)]">
              {listing.currency} {listing.price}
            </p>
          ) : (
            <p className="text-lg text-[var(--color-text-secondary)] italic">{t.search.priceNotListed}</p>
          )}
        </div>

        <Link
          href={`/medicine/${medicine.id}`}
          className="inline-flex items-center gap-1 pb-1 text-[15px] font-medium text-[var(--color-brand)] hover:underline"
        >
          {t.pharmacyDetail.viewDrugInfo}
          <ChevronRightIcon />
        </Link>
      </div>
    </div>
  );
}
