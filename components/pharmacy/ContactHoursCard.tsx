"use client";

import { useState } from "react";
import type { Pharmacy } from "@/lib/types/pharmacy";
import { AddressPinIcon, ChevronDownIcon, PhoneIcon, RecentClockIcon } from "@/components/ui/icons";
import { parseHoursRange } from "@/lib/utils/hours";
import { useTranslation } from "@/lib/i18n/useTranslation";

/**
 * "Contact & Hours" card — extracted from Page 8's Figma frame (node
 * 6:807): address row, phone row (real tel: link), and today's hours with
 * an in-page "See all hours" expand (PRD §5 "Hours expanded" state). The
 * weekly hours list is a documented dev placeholder (Pharmacy only stores
 * a single `hours` range, not per-day hours — PRD's own example data).
 * Row labels ("Address"/"Phone"/"Hours") are screen-reader-only: Figma's
 * own design relies on icons alone, so we keep the icon-only look while
 * still satisfying PRD §8 accessibility's "logical, readable" requirement.
 */
export function ContactHoursCard({ pharmacy }: { pharmacy: Pharmacy }) {
  const { t } = useTranslation();
  const [hoursExpanded, setHoursExpanded] = useState(false);
  const range = parseHoursRange(pharmacy.hours);

  return (
    <div className="flex flex-1 flex-col gap-5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-[25px]">
      <h2 className="text-base font-semibold text-[var(--color-text-primary)]">{t.pharmacyDetail.contactHours}</h2>

      <div className="flex items-start gap-3">
        <AddressPinIcon className="mt-0.5 shrink-0 text-[var(--color-text-secondary)]" />
        <div>
          <span className="sr-only">{t.pharmacyDetail.addressField}: </span>
          <p className="text-base text-[var(--color-text-primary)]">{pharmacy.address}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <PhoneIcon className="shrink-0 text-[var(--color-text-secondary)]" />
        <span className="sr-only">{t.pharmacyDetail.phoneField}: </span>
        <a href={`tel:${pharmacy.phone}`} className="text-base font-medium text-[var(--color-brand)] hover:underline">
          {pharmacy.phone}
        </a>
      </div>

      <div className="flex items-start gap-3">
        <RecentClockIcon className="mt-1 shrink-0 text-[var(--color-text-secondary)]" />
        <div className="flex-1">
          <span className="sr-only">{t.pharmacyDetail.hoursField}: </span>
          <div className="flex items-center justify-between gap-3">
            <p className="text-base text-[var(--color-text-primary)]">{t.pharmacyDetail.today}</p>
            {range && (
              <p className="text-base font-medium text-[var(--color-text-primary)]">
                {range.opens} &ndash; {range.closes}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setHoursExpanded((v) => !v)}
            aria-expanded={hoursExpanded}
            className="mt-2 inline-flex cursor-pointer items-center gap-1 text-[15px] font-medium text-[var(--color-brand)] hover:underline"
          >
            {hoursExpanded ? t.pharmacyDetail.hideHours : t.pharmacyDetail.seeAllHours}
            <ChevronDownIcon className={`transition-transform ${hoursExpanded ? "rotate-180" : ""}`} />
          </button>

          {hoursExpanded && (
            <ul className="mt-3 flex flex-col gap-1.5 border-t border-[var(--color-border)] pt-3 text-sm text-[var(--color-text-secondary)]">
              <li>{t.pharmacyDetail.weekdaysHours}</li>
              <li>{t.pharmacyDetail.sundayHours}</li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
