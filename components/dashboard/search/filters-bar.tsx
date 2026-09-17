"use client";

import * as React from "react";
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

/** How many filters are narrowing the search. The trigger and its "clear" action live
 * with the search bar; this count feeds both. */
export function activeFilterCount(f: SearchFilters): number {
  return [f.dosageForm !== "", f.stockStatus !== "all", f.radiusKm !== null].filter(Boolean)
    .length;
}

const DOSAGE_FORMS = ["tablet", "capsule", "syrup", "injection", "cream", "drops"] as const;
const RADIUS_OPTIONS = [1, 2, 5, 10, 20, 50] as const;

const selectClass =
  "h-11 w-full min-w-0 rounded-md border border-input bg-card px-3 text-base text-foreground sm:text-sm " +
  "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 " +
  "disabled:cursor-not-allowed disabled:opacity-60";
const labelClass = "mb-1.5 block text-xs font-medium text-muted-foreground";

/** The filter controls only. The trigger, active count and "clear" affordance live with
 * the search bar, so this drops in as a panel without a second heading. */
export function FiltersBar({
  id,
  value,
  onChange,
  locationOn,
  disabled,
  t,
  className,
}: {
  id?: string;
  value: SearchFilters;
  onChange: (next: SearchFilters) => void;
  locationOn: boolean;
  disabled?: boolean;
  t: Dictionary;
  className?: string;
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
      id={id}
      role={"group"}
      aria-label={f.label}
      className={cn("grid grid-cols-1 gap-3 sm:grid-cols-3", className)}
    >
      <div className={"min-w-0"}>
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

      <div className={"min-w-0"}>
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

      <div className={"min-w-0"}>
        <label htmlFor={radiusId} className={labelClass}>
          {f.radius}
        </label>
        <select
          id={radiusId}
          className={selectClass}
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
  );
}
