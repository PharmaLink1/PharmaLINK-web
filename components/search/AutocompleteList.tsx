"use client";

import type { Medicine } from "@/lib/types/medicine";

/**
 * Autocomplete suggestions dropdown (Page 6 PRD §6: "Autocomplete is a
 * proper listbox — arrow-key navigable, announced"). Backed today by
 * lib/api/medicines.ts's mock-filtered catalog; swaps to the real Go
 * search endpoint later with no change here, since that file's USE_MOCKS
 * flag is the only thing that changes.
 */
export function AutocompleteList({
  id,
  suggestions,
  highlightedIndex,
  onSelect,
}: {
  id?: string;
  suggestions: Medicine[];
  highlightedIndex: number;
  onSelect: (medicine: Medicine) => void;
}) {
  if (suggestions.length === 0) return null;

  return (
    <ul
      id={id}
      role="listbox"
      className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
    >
      {suggestions.map((medicine, index) => (
        <li key={medicine.id} role="option" aria-selected={index === highlightedIndex}>
          <button
            type="button"
            // Prevents the input from losing focus (and the dropdown from
            // closing via blur) before the click's onSelect fires.
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelect(medicine)}
            className={`flex w-full flex-col items-start px-4 py-2.5 text-left transition-colors ${
              index === highlightedIndex ? "bg-[var(--color-canvas)]" : "hover:bg-[var(--color-canvas)]"
            }`}
          >
            <span className="text-sm font-medium text-[var(--color-text-primary)]">{medicine.genericName}</span>
            {medicine.brandNames.length > 0 && (
              <span className="text-xs text-[var(--color-text-secondary)]">{medicine.brandNames.join(", ")}</span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
