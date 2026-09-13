"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { Medicine } from "@/lib/types/medicine";
import { searchMedicines } from "@/lib/api/medicines";
import { AutocompleteList } from "@/components/search/AutocompleteList";
import { useTranslation } from "@/lib/i18n/useTranslation";

const SUGGESTION_DEBOUNCE_MS = 150;

/**
 * Medicine picker for the Add/Edit reminder dialog (Page 12 PRD §4) — the
 * same debounced-combobox + AutocompleteList + keyboard-nav + click-outside
 * pattern as components/search/SearchBar.tsx, reused rather than rebuilt.
 * Differs from SearchBar in one way: selecting a suggestion captures the
 * full Medicine into form state instead of submitting a GET search.
 */
export function MedicinePicker({
  selected,
  onSelect,
  error,
}: {
  selected: Medicine | null;
  onSelect: (medicine: Medicine | null) => void;
  error?: string;
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState(selected?.genericName ?? "");
  const [suggestions, setSuggestions] = useState<Medicine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    // Intentional fetch-on-value-change (debounced), same pattern as
    // SearchBar's own suggestion effect.
    if (!trimmed || (selected && trimmed === selected.genericName)) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

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
    setQuery(medicine.genericName);
    setIsOpen(false);
    onSelect(medicine);
  }

  function handleChange(value: string) {
    setQuery(value);
    if (selected) onSelect(null);
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
    <div ref={containerRef} className="relative flex flex-col gap-2">
      <label htmlFor="reminder-medicine" className="text-sm font-medium text-[var(--color-text-primary)]">
        {t.reminders.medicineLabel}
      </label>
      <input
        id="reminder-medicine"
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        aria-controls="reminder-medicine-listbox"
        aria-invalid={error ? true : undefined}
        type="text"
        autoComplete="off"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setIsOpen(true)}
        placeholder={t.reminders.medicinePlaceholder}
        className={`h-12 w-full rounded-[var(--radius-input)] border bg-[var(--color-surface)] px-[17px] text-base text-[var(--color-text-primary)] outline-none transition-colors placeholder:text-[var(--color-text-placeholder)] focus:ring-2 ${
          error
            ? "border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/20"
            : "border-[var(--color-border)] focus:border-[var(--color-focus)] focus:ring-[var(--color-focus)]/25"
        }`}
      />
      {error && (
        <p className="text-sm text-[var(--color-error)]" aria-live="polite">
          {error}
        </p>
      )}

      {isOpen && (
        <AutocompleteList
          id="reminder-medicine-listbox"
          suggestions={suggestions}
          highlightedIndex={highlightedIndex}
          onSelect={selectMedicine}
        />
      )}
    </div>
  );
}
