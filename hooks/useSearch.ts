"use client";

import { useCallback, useState } from "react";
import type { Medicine } from "@/lib/types/medicine";
import type { PharmacyListingResult } from "@/lib/types/inventoryListing";
import { searchMedicines, getMedicineListings } from "@/lib/api/medicines";

export type SearchStatus = "idle" | "loading" | "success" | "error" | "empty";

/**
 * Powers Patient Home's autocomplete (Page 6) and Search Results' listing
 * fetch (Page 7). Kept as plain React state + a hook, per the confirmed
 * "no external state library" decision.
 */
export function useSearch() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Medicine[]>([]);
  const [results, setResults] = useState<PharmacyListingResult[]>([]);
  const [status, setStatus] = useState<SearchStatus>("idle");

  const searchSuggestions = useCallback(async (nextQuery: string) => {
    setQuery(nextQuery);
    if (!nextQuery.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      const matches = await searchMedicines(nextQuery);
      setSuggestions(matches);
    } catch {
      setSuggestions([]);
    }
  }, []);

  const loadResultsForMedicine = useCallback(async (medicineId: string) => {
    setStatus("loading");
    try {
      const listings = await getMedicineListings(medicineId);
      setResults(listings);
      setStatus(listings.length === 0 ? "empty" : "success");
    } catch {
      setStatus("error");
    }
  }, []);

  return {
    query,
    suggestions,
    results,
    status,
    searchSuggestions,
    loadResultsForMedicine,
  };
}
