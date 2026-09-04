"use client";

import * as React from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { StockStatus } from "@/lib/search-types";
import { interpolate } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/cn";

/** Controlled search filters. `stockStatus: "all"` and `radiusKm: null` mean "no
 * filter"; the container maps those to omitted query params. */
export type SearchFilters = {
  dosageForm: string; // "" = any; otherwise the lowercase wire value (tablet, syrup, …)
  stockStatus: StockStatus | "all";
  radiusKm: number | null; // null = any distance
};

export const DEFAULT_FILTERS: SearchFilters = {
  dosageForm: "",
  stockStatus: "all",
  radiusKm: null,
};

export function filtersAreDefault(f: SearchFilters): boolean {
  return f.dosageForm === "" && f.stockStatus === "all" && f.radiusKm === null;
}

const DOSAGE_FORMS = ["tablet", "capsule", "syrup", "injection", "cream", "drops"] as const;
const RADIUS_OPTIONS = [1, 2, 5, 10, 20, 50] as const;

const selectClass =
  "h-11 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 " +
  "disabled:cursor-not-allowed disabled:opacity-60";
const labelClass = "mb-1.5 block text-xs font-medium text-muted-foreground";

export function FiltersBar({
  value,
  onChange,
  locationOn,
  disabled,
  t,
}: {
  value: SearchFilters;
  onChange: (next: SearchFilters) => void;
  locationOn: boolean;
  disabled?: boolean;
  t: Dictionary;
}) {
  const f = t.dashboard.search.filters;
  const dosageFormId = "search-filter-dosage-form";
  const stockId = "search-filter-stock";
  const radiusId = "search-filter-radius";

  const stockOptions: { value: SearchFilters["stockStatus"]; label: string }[] = [
    { value: "all", label: f.stockAny },
    { value: "in_stock", label: t.common.inStock },
    { value: "low_stock", label: t.common.lowStock },
    { value: "out_of_stock", label: t.common.outOfStock },
  ];

  return (
    <div
      role={"group"}
      aria-label={f.label}
      className={"mt-4 border-t border-border pt-4"}
    >
      <div className={"mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground"}>
        <SlidersHorizontal className={"size-3.5"} aria-hidden />
        {f.label}
        {!filtersAreDefault(value) && (
          <button
            type={"button"}
            onClick={() => onChange(DEFAULT_FILTERS)}
            disabled={disabled}
            className={"ml-auto inline-flex items-center gap-1 rounded font-medium text-primary-strong hover:underline disabled:opacity-60"}
          >
            <X className={"size-3.5"} aria-hidden />
            {f.clear}
          </button>
        )}
      </div>

      <div className={"grid grid-cols-1 gap-3 sm:grid-cols-3"}>
        <div>
          <label htmlFor={dosageFormId} className={labelClass}>
            {f.dosageForm}
          </label>
          <select
            id={dosageFormId}
            className={selectClass}
            value={value.dosageForm}
            disabled={disabled}
            onChange={(e) => onChange({ ...value, dosageForm: e.target.value })}
          >
            <option value={""}>{f.dosageFormAny}</option>
            {DOSAGE_FORMS.map((form) => (
              <option key={form} value={form}>
                {f.forms[form]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={stockId} className={labelClass}>
            {f.stock}
          </label>
          <select
            id={stockId}
            className={selectClass}
            value={value.stockStatus}
            disabled={disabled}
            onChange={(e) =>
              onChange({ ...value, stockStatus: e.target.value as SearchFilters["stockStatus"] })
            }
          >
            {stockOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={radiusId} className={labelClass}>
            {f.radius}
          </label>
          <select
            id={radiusId}
            className={cn(selectClass)}
            value={value.radiusKm === null ? "" : String(value.radiusKm)}
            disabled={disabled || !locationOn}
            onChange={(e) =>
              onChange({ ...value, radiusKm: e.target.value === "" ? null : Number(e.target.value) })
            }
          >
            <option value={""}>{f.radiusAny}</option>
            {RADIUS_OPTIONS.map((km) => (
              <option key={km} value={String(km)}>
                {interpolate(f.radiusOption, { km })}
              </option>
            ))}
          </select>
          {!locationOn && (
            <p className={"mt-1 text-xs text-muted-foreground"}>{f.radiusLocationHint}</p>
          )}
        </div>
      </div>
    </div>
  );
}
