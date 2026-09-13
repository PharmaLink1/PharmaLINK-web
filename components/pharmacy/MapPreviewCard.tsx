"use client";

import { AddressPinIcon } from "@/components/ui/icons";
import { useTranslation } from "@/lib/i18n/useTranslation";

/** Real Google Maps deep link — same external hand-off as the "Get directions" button (PRD §6.2). */
function directionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/**
 * Light/lazy static "map preview" — extracted from Page 8's Figma frame
 * (node 6:833): a muted panel with a faint abstract radial pattern (never
 * real map tiles, kept intentionally light for 3G/4G per PRD §9.1) and a
 * single pin marker. The whole card opens the device's maps app, same
 * destination as "Get directions" — matching PRD §5 "Map preview /
 * 'Open in maps' → same as Get directions".
 */
export function MapPreviewCard({ lat, lng }: { lat: number; lng: number }) {
  const { t } = useTranslation();

  return (
    <a
      href={directionsUrl(lat, lng)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.pharmacyDetail.openInMaps}
      className="group relative flex min-h-[220px] flex-1 items-center justify-center overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] sm:min-h-0"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 220px 160px at 50% 42%, var(--color-text-placeholder) 0%, transparent 70%)",
        }}
      />
      <AddressPinIcon className="relative h-9 w-6 text-[var(--color-brand)] drop-shadow-sm" />
      <span className="pointer-events-none absolute bottom-6 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)] opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
        {t.pharmacyDetail.openInMaps}
      </span>
    </a>
  );
}
