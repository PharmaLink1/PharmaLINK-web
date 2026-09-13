"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import type { Medicine } from "@/lib/types/medicine";
import { searchMedicines } from "@/lib/api/medicines";
import { SearchIcon, CloseIcon } from "@/components/ui/icons";
import { AutocompleteList } from "@/components/search/AutocompleteList";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface SearchBarProps {
  value: string;
  placeholder?: string;
  label: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  /** Compact variant for reuse on Search Results' pre-filled/editable bar
   * (matches that Figma frame's own #f8faf6 input background); the default
   * (large) variant is Patient Home's hero search (Page 6, white input). */
  compact?: boolean;
  /** When provided, renders an attached submit button after the input
   * (the landing page's hero search has one); omitted renders just the
   * bare input (Patient Home / Search Results submit on Enter only). */
  submitLabel?: string;
}

const SUGGESTION_DEBOUNCE_MS = 150;

/**
 * Shared search input (Page 6 PRD §4: "Search bar — NEW, core; reused on
 * Results/anywhere search appears"), matching node 6:355's exact spec:
 * white surface, hairline border, inset search icon, 12px radius, ~52px
 * tall. A real GET form so it still works with JavaScript disabled.
 *
 * Includes autocomplete (Page 6 PRD §6: suggestions as you type) — backed
 * by lib/api/medicines.ts's searchMedicines(), which is already mock-data
 * today and swaps to the real Go endpoint later with no change here.
 */
export function SearchBar({ value, placeholder, label, onChange, onSubmit, compact = false, submitLabel }: SearchBarProps) {
  const { t } = useTranslation();
  const [suggestions, setSuggestions] = useState<Medicine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Intentional fetch-on-value-change (debounced), same pattern as
    // SearchResultsView's runSearch effect: the effect's job is
    // synchronizing suggestions with the current input via an external
    // (eventually network) call; the early-return below just skips that
    // call when there's nothing to search for.
    const trimmed = value.trim();
    if (!trimmed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const matches = await searchMedicines(trimmed);
        if (cancelled) return;
        setSuggestions(matches);
        setIsOpen(matches.length > 0);
        setHighlightedIndex(-1);
      } catch {
        if (!cancelled) setSuggestions([]);
      }
    }, SUGGESTION_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectMedicine(medicine: Medicine) {
    setIsOpen(false);
    onChange(medicine.genericName);
    onSubmit?.(medicine.genericName);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsOpen(false);
    onSubmit?.(value);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      selectMedicine(suggestions[highlightedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        onSubmit={handleSubmit}
        action="/search"
        method="GET"
        className={submitLabel ? "flex w-full flex-col gap-3 sm:flex-row" : "w-full"}
      >
        <div className={`relative ${submitLabel ? "flex-1" : "w-full"}`}>
          <label htmlFor="search-bar-input" className="sr-only">
            {label}
          </label>
          <SearchIcon
            className={`pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[var(--color-text-secondary)] ${compact ? "" : "size-[17px]"}`}
          />
          <input
            id="search-bar-input"
            role="combobox"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-controls="search-bar-listbox"
            type="search"
            name="q"
            autoComplete="off"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setIsOpen(true)}
            placeholder={placeholder}
            className={`w-full rounded-[12px] border border-[var(--color-border)] pr-9 pl-11 text-base text-[var(--color-text-primary)] placeholder:text-[var(--color-text-placeholder)] outline-none transition-colors focus:border-[var(--color-focus)] focus:ring-2 focus:ring-[var(--color-focus)]/25 ${
              compact ? "h-11 bg-[var(--color-surface-muted)] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" : "h-[52px] bg-[var(--color-surface)]"
            }`}
          />
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
              aria-label={t.search.clearSearch}
              className="absolute top-1/2 right-3 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              <CloseIcon />
            </button>
          )}
        </div>

        {submitLabel && (
          <button
            type="submit"
            className="inline-flex shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-[var(--color-brand)] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[var(--color-brand-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]/40"
          >
            {submitLabel}
          </button>
        )}
      </form>

      {isOpen && (
        <AutocompleteList
          id="search-bar-listbox"
          suggestions={suggestions}
          highlightedIndex={highlightedIndex}
          onSelect={selectMedicine}
        />
      )}
    </div>
  );
}
