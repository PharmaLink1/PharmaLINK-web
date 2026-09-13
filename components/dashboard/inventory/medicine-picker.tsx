"use client";

import * as React from "react";
import { Check, LoaderCircle, Search, X } from "lucide-react";
import { searchApi } from "@/lib/api-client";
import type { MedicineSuggestion } from "@/lib/search-types";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";

const DEBOUNCE_MS = 250;

/** Label for a medicine suggestion: "Paracetamol 500mg (Panadol)", degrading to
 * whichever parts exist. The autocomplete endpoint also ships a ready display_name,
 * which we prefer when present. */
export function medicineLabel(m: MedicineSuggestion): string {
  if (m.display_name) return m.display_name;
  let name = m.generic_name || m.brand_name || "";
  if (m.strength) name += " " + m.strength;
  if (m.generic_name && m.brand_name && m.brand_name !== m.generic_name) {
    name += " (" + m.brand_name + ")";
  }
  return name;
}

/** Catalogue picker: the pharmacist searches the catalogue via the public autocomplete
 * (the admin catalogue endpoints are admin-only) and selects a medicine, so the listing
 * links by id and patients searching that name find it. */
export function MedicinePicker({
  selected,
  onSelect,
  disabled,
  t,
}: {
  selected: MedicineSuggestion | null;
  onSelect: (medicine: MedicineSuggestion | null) => void;
  disabled?: boolean;
  t: Dictionary;
}) {
  const add = t.dashboard.inventory.add;
  const [term, setTerm] = React.useState("");
  const [results, setResults] = React.useState<MedicineSuggestion[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const seqRef = React.useRef(0);

  React.useEffect(() => {
    const q = term.trim();
    if (selected || !q) {
      // Clear the dropdown when there's nothing to search — a debounced data-fetch
      // effect, so the scoped disable matches the search autocomplete pattern.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      setOpen(false);
      return;
    }
    const seq = ++seqRef.current;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setOpen(true);
      searchApi
        .autocomplete(q)
        .then((rows) => {
          if (seqRef.current !== seq) return;
          setResults(rows);
          setLoading(false);
        })
        .catch(() => {
          if (seqRef.current !== seq) return;
          setResults([]);
          setLoading(false);
        });
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [term, selected]);

  if (selected) {
    return (
      <div className={"flex items-center justify-between gap-3 rounded-md border border-border bg-muted px-3.5 py-2.5"}>
        <span className={"flex min-w-0 items-center gap-2 text-sm font-medium text-foreground"}>
          <Check className={"size-4 shrink-0 text-success"} aria-hidden />
          <span className={"truncate"}>{medicineLabel(selected)}</span>
        </span>
        <button
          type={"button"}
          onClick={() => {
            onSelect(null);
            setTerm("");
          }}
          disabled={disabled}
          className={"inline-flex shrink-0 items-center gap-1 rounded text-xs font-medium text-primary-strong hover:underline disabled:opacity-60"}
        >
          <X className={"size-3.5"} aria-hidden />
          {add.change}
        </button>
      </div>
    );
  }

  return (
    <div className={"relative"}>
      <Search
        className={"pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"}
        aria-hidden
      />
      <Input
        id={"inventory-medicine"}
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        onFocus={() => {
          if (term.trim()) setOpen(true);
        }}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        placeholder={add.medicinePlaceholder}
        autoComplete={"off"}
        disabled={disabled}
        className={"pl-10"}
      />
      {open && (
        <ul
          role={"listbox"}
          aria-label={add.medicine}
          className={"absolute z-20 mt-1.5 max-h-64 w-full overflow-y-auto rounded-md border border-border bg-card py-1 shadow-md"}
        >
          {loading && (
            <li role={"status"} className={"flex items-center gap-2 px-3.5 py-2.5 text-sm text-muted-foreground"}>
              <LoaderCircle className={"size-4 animate-spin"} aria-hidden />
              {add.searching}
            </li>
          )}
          {!loading && results.length === 0 && (
            <li className={"px-3.5 py-2.5 text-sm text-muted-foreground"}>{add.noMatches}</li>
          )}
          {!loading &&
            results.map((m) => (
              <li key={m.medicine_id}>
                <button
                  type={"button"}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onSelect(m);
                    setOpen(false);
                  }}
                  className={cn(
                    "block w-full truncate px-3.5 py-2.5 text-left text-sm text-foreground",
                    "hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
                  )}
                >
                  {medicineLabel(m)}
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
