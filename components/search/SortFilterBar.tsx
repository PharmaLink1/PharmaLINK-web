"use client";

import { ChevronDownIcon, FilterCheckIcon, SortIcon } from "@/components/ui/icons";
import { useTranslation } from "@/lib/i18n/useTranslation";

export type SortOption = "distance" | "price";

/**
 * Sort + filter controls row — extracted from Page 7's Figma frame (node
 * 6:519, "Section - Controls Row"). Sort cycles between the two options on
 * click rather than a native <select>, to match the exact pill+chevron
 * look; filter chips toggle independently and show the active teal-tint
 * treatment with a checkmark when on.
 */
export function SortFilterBar({
  sort,
  onSortChange,
  inStockOnly,
  onInStockOnlyChange,
  openNowOnly,
  onOpenNowOnlyChange,
}: {
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  inStockOnly: boolean;
  onInStockOnlyChange: (value: boolean) => void;
  openNowOnly: boolean;
  onOpenNowOnlyChange: (value: boolean) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => onSortChange(sort === "distance" ? "price" : "distance")}
        className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-[13px] py-[7px] text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-canvas)]"
      >
        <SortIcon className="text-[var(--color-text-secondary)]" />
        {sort === "distance" ? t.search.sortDistance : t.search.sortPrice}
        <ChevronDownIcon className="text-[var(--color-text-secondary)]" />
      </button>

      <button
        type="button"
        aria-pressed={inStockOnly}
        onClick={() => onInStockOnlyChange(!inStockOnly)}
        className={`inline-flex items-center gap-2 rounded-full border px-[13px] py-[7px] text-sm font-medium transition-colors ${
          inStockOnly
            ? "border-[var(--color-brand)] bg-[var(--color-stock-in-border)] text-[var(--color-text-primary)]"
            : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-canvas)]"
        }`}
      >
        {inStockOnly && <FilterCheckIcon />}
        {t.search.filterInStock}
      </button>

      <button
        type="button"
        aria-pressed={openNowOnly}
        onClick={() => onOpenNowOnlyChange(!openNowOnly)}
        className={`inline-flex items-center gap-2 rounded-full border px-[13px] py-[7px] text-sm font-medium transition-colors ${
          openNowOnly
            ? "border-[var(--color-brand)] bg-[var(--color-stock-in-border)] text-[var(--color-text-primary)]"
            : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-canvas)]"
        }`}
      >
        {openNowOnly && <FilterCheckIcon />}
        {t.search.filterOpenNow}
      </button>
    </div>
  );
}
