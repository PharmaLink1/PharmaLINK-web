"use client";

import { RecentClockIcon } from "@/components/ui/icons";

/**
 * Tappable pill used for both "Recent searches" and "Common medicines" on
 * Patient Home (Page 6, node 6:355) — the PRD calls this out as one
 * reusable component ("Medicine chip / suggestion row").
 */
export function MedicineChip({
  label,
  onClick,
  showClockIcon = false,
}: {
  label: string;
  onClick: () => void;
  showClockIcon?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-[17px] py-[9px] text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-canvas)]"
    >
      {showClockIcon && <RecentClockIcon className="text-[var(--color-text-secondary)]" />}
      {label}
    </button>
  );
}
