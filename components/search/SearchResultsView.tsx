"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Medicine } from "@/lib/types/medicine";
import type { PharmacyListingResult } from "@/lib/types/inventoryListing";
import { getMedicineListings, searchMedicines } from "@/lib/api/medicines";
import { PharmacyResultCard } from "@/components/search/PharmacyResultCard";
import { SearchBar } from "@/components/search/SearchBar";
import { SortFilterBar, type SortOption } from "@/components/search/SortFilterBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ArrowLeftIcon, InfoCircleIcon, PrescriptionIcon } from "@/components/ui/icons";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useRecentSearches } from "@/hooks/useRecentSearches";

type ViewStatus = "idle" | "loading" | "success" | "empty" | "error";

/**
 * Resolves a free-text query (from the URL's `q` param — typed on the
 * landing page hero or Patient Home) into an actual medicine match and its
 * pharmacy listings, using the existing lib/api/medicines.ts functions
 * (mock-backed via USE_MOCKS, ready to swap to the real Go endpoints later
 * with no change here). Header, controls row, and card layout extracted
 * from Page 7's actual Figma frame (node 6:519).
 */
export function SearchResultsView({ query }: { query: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { addRecentSearch } = useRecentSearches();
  const [status, setStatus] = useState<ViewStatus>("idle");
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [results, setResults] = useState<PharmacyListingResult[]>([]);
  const [inputValue, setInputValue] = useState(query);
  const [syncedQuery, setSyncedQuery] = useState(query);

  const [sort, setSort] = useState<SortOption>("distance");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [openNowOnly, setOpenNowOnly] = useState(false);

  // Keep the editable field in sync if the URL's query changes from outside
  // this component (e.g. navigating here again with a new chip). Adjusted
  // during render rather than in an effect, per React's guidance for
  // resetting state when a prop changes.
  if (query !== syncedQuery) {
    setSyncedQuery(query);
    setInputValue(query);
  }

  function handleRefineSubmit(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  const runSearch = useCallback(
    async (rawQuery: string) => {
      const trimmed = rawQuery.trim();
      if (!trimmed) {
        setStatus("idle");
        setMedicine(null);
        setResults([]);
        return;
      }
      addRecentSearch(trimmed);
      setStatus("loading");
      try {
        const matches = await searchMedicines(trimmed);
        const match = matches[0] ?? null;
        setMedicine(match);
        if (!match) {
          setResults([]);
          setStatus("empty");
          return;
        }
        const listings = await getMedicineListings(match.id);
        setResults(listings);
        setStatus(listings.length === 0 ? "empty" : "success");
      } catch {
        setStatus("error");
      }
    },
    [addRecentSearch]
  );

  useEffect(() => {
    // Intentional fetch-on-query-change, same pattern as AuthContext's
    // fetch-on-mount refresh(): the effect's job is running the async
    // lookup, which itself calls setState once results resolve.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    runSearch(query);
  }, [query, runSearch]);

  const visibleResults = useMemo(() => {
    let list = results;
    if (inStockOnly) list = list.filter((r) => r.stockStatus === "in_stock");
    if (openNowOnly) list = list.filter((r) => r.pharmacy.isOpenNow);

    return [...list].sort((a, b) => {
      if (sort === "price") {
        if (a.price == null) return 1;
        if (b.price == null) return -1;
        return a.price - b.price;
      }
      return (a.pharmacy.distanceKm ?? Infinity) - (b.pharmacy.distanceKm ?? Infinity);
    });
  }, [results, inStockOnly, openNowOnly, sort]);

  const hasActiveFilters = inStockOnly || openNowOnly;

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
      >
        <ArrowLeftIcon />
        {t.common.back}
      </Link>

      <div className="w-full max-w-[448px]">
        <SearchBar
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleRefineSubmit}
          placeholder={t.landing.heroSearchPlaceholder}
          label={t.landing.heroSearchLabel}
          compact
        />
      </div>

      {status !== "idle" && medicine && (
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[26px] leading-8 font-bold text-[var(--color-text-primary)]">{medicine.genericName}</h1>
            {medicine.requiresPrescription && (
              <span className="inline-flex items-center gap-1 rounded-[4px] border border-[var(--color-border)] bg-[var(--color-canvas)] px-[9px] py-[5px] text-xs text-[var(--color-text-secondary)]">
                <PrescriptionIcon />
                {t.drugInfo.prescriptionNeeded}
              </span>
            )}
            <Link
              href={`/medicine/${medicine.id}`}
              className="inline-flex items-center gap-1 text-[15px] font-medium text-[var(--color-brand)] hover:underline"
            >
              {t.search.drugInfoLink}
              <InfoCircleIcon />
            </Link>
          </div>
          {status === "success" && (
            <p className="text-base text-[var(--color-text-secondary)]">
              {results.length} {t.search.pharmaciesFound}
            </p>
          )}
        </div>
      )}

      {status !== "idle" && !medicine && status !== "loading" && (
        <h1 className="text-xl font-bold text-[var(--color-text-primary)] sm:text-2xl">
          {t.search.resultsFor} &ldquo;{query}&rdquo;
        </h1>
      )}

      {status === "idle" && <EmptyState title={t.search.searchPrompt} />}

      {status === "loading" && (
        <div className="flex flex-col gap-3" aria-busy="true" aria-live="polite">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {status === "error" && (
        <EmptyState
          title={t.common.errorGeneric}
          action={
            <button
              type="button"
              onClick={() => runSearch(query)}
              className="rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-canvas)]"
            >
              {t.common.retry}
            </button>
          }
        />
      )}

      {status === "empty" && <EmptyState title={t.search.noResults} />}

      {status === "success" && (
        <>
          <div className="border-b border-[var(--color-border)] pb-4">
            <SortFilterBar
              sort={sort}
              onSortChange={setSort}
              inStockOnly={inStockOnly}
              onInStockOnlyChange={setInStockOnly}
              openNowOnly={openNowOnly}
              onOpenNowOnlyChange={setOpenNowOnly}
            />
          </div>

          {visibleResults.length === 0 ? (
            <EmptyState
              title={t.search.noFilteredResults}
              action={
                <button
                  type="button"
                  onClick={() => {
                    setInStockOnly(false);
                    setOpenNowOnly(false);
                  }}
                  className="rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-canvas)]"
                >
                  {t.search.clearFilters}
                </button>
              }
            />
          ) : (
            <div className="flex flex-col gap-4">
              {visibleResults.map((listing) => (
                <PharmacyResultCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}

          {hasActiveFilters && visibleResults.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setInStockOnly(false);
                setOpenNowOnly(false);
              }}
              className="self-start text-sm font-medium text-[var(--color-brand)] hover:underline"
            >
              {t.search.clearFilters}
            </button>
          )}
        </>
      )}
    </div>
  );
}
