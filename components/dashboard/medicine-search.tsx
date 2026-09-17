"use client";

import * as React from "react";
import { ChevronDown, LoaderCircle, LocateFixed, Search, SlidersHorizontal, X } from "lucide-react";
import { notifyApi, searchApi } from "@/lib/api-client";
import type {
  MedicineSearchResult,
  MedicineSuggestion,
  NearbyPharmacy,
} from "@/lib/search-types";
import { interpolate, useLanguage } from "@/lib/i18n";
import { getErrorMessage } from "@/lib/i18n/errors";
import { groupByMedicine } from "@/lib/search-grouping";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  activeFilterCount,
  DEFAULT_FILTERS,
  FiltersBar,
  type SearchFilters,
} from "@/components/dashboard/search/filters-bar";
import { MedicineGroupCard } from "@/components/dashboard/search/medicine-group-card";
import { NearbyList } from "@/components/dashboard/search/nearby-list";
import { NotifyButton } from "@/components/dashboard/search/notify-button";
import { cn } from "@/lib/cn";

const RESULTS_PER_PAGE = 10;
const AUTOCOMPLETE_DEBOUNCE_MS = 250;

/** Secondary text for a suggestion row: strength and generic name, when they add
 * something the display name doesn't already say. */
function suggestionDetail(suggestion: MedicineSuggestion): string {
  const generic =
    suggestion.generic_name === suggestion.display_name ? null : suggestion.generic_name;
  return [suggestion.strength, generic].filter(Boolean).join(" · ");
}

type SearchPhase = "idle" | "loading" | "success" | "error";
type Location = { lat: number; lng: number };

export function MedicineSearch() {
  const { t } = useLanguage();
  const time = t.dashboard.search.time;

  const [query, setQuery] = React.useState("");
  const [phase, setPhase] = React.useState<SearchPhase>("idle");
  const [error, setError] = React.useState("");
  const [results, setResults] = React.useState<MedicineSearchResult[]>([]);
  const [nearby, setNearby] = React.useState<NearbyPharmacy[]>([]);
  const [pagination, setPagination] = React.useState({ page: 1, total: 0 });
  const [submittedQuery, setSubmittedQuery] = React.useState("");
  const [submittedMedicineId, setSubmittedMedicineId] = React.useState<string | null>(null);
  const [failedQuery, setFailedQuery] = React.useState("");
  const [loadingMore, setLoadingMore] = React.useState(false);

  const [filters, setFilters] = React.useState<SearchFilters>(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  const [suggestions, setSuggestions] = React.useState<MedicineSuggestion[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = React.useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);

  const [location, setLocation] = React.useState<Location | null>(null);
  const [locating, setLocating] = React.useState(false);
  const [locationError, setLocationError] = React.useState<"denied" | "failed" | null>(null);

  // Notify-me is tracked only for this session: a subscribe returns an id we hold so
  // the button can offer Cancel. There is no "list my subscriptions" endpoint, so this
  // resets on reload.
  const [subs, setSubs] = React.useState<Map<string, string>>(new Map());
  const [notifyPending, setNotifyPending] = React.useState<Set<string>>(new Set());
  const [notifyError, setNotifyError] = React.useState<Map<string, string>>(new Map());
  const [nearbyLoading, setNearbyLoading] = React.useState(false);
  const [nearbyError, setNearbyError] = React.useState("");

  const seqRef = React.useRef(0);
  const skipSuggestionsRef = React.useRef(false);
  const didMountRef = React.useRef(false);
  const inputId = "medicine-search-input";
  const listboxId = "medicine-search-suggestions";
  const filtersPanelId = "medicine-search-filters";

  const groups = React.useMemo(() => groupByMedicine(results), [results]);

  const filtersT = t.dashboard.search.filters;
  const activeFilters = activeFilterCount(filters);

  // Debounced autocomplete for as-you-type suggestions. Only the latest
  // typed query may update the list; full searches run on submit/select.
  React.useEffect(() => {
    const term = query.trim();
    if (skipSuggestionsRef.current) {
      // A suggestion or example was just selected: the handler already reset
      // the list and started the full search, so keep the dropdown closed.
      skipSuggestionsRef.current = false;
      return;
    }
    if (!term) return; // clearing is handled by the input change handler
    const seq = ++seqRef.current;
    const timer = window.setTimeout(() => {
      setSuggestionsLoading(true);
      setSuggestionsOpen(true);
      setSuggestions([]);
      setActiveIndex(-1);
      searchApi
        .autocomplete(term)
        .then((data) => {
          if (seqRef.current !== seq) return;
          setSuggestions(data);
          setSuggestionsOpen(data.length > 0);
          setSuggestionsLoading(false);
          setActiveIndex(-1);
        })
        .catch(() => {
          if (seqRef.current !== seq) return;
          setSuggestions([]);
          setSuggestionsOpen(false);
          setSuggestionsLoading(false);
        });
    }, AUTOCOMPLETE_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query]);

  // Re-run the active search when a filter or the location changes. Skips the first
  // mount and only fires with a live search, mirroring applications-review.tsx.
  React.useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    if (!submittedQuery || phase === "idle") return;
    void runSearch(submittedQuery, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.dosageForm, filters.stockStatus, filters.radiusKm, location]);

  async function runSearch(term: string, page = 1) {
    const trimmed = term.trim();
    // One guard covers submit, suggestion-select, filter re-runs, and "show more":
    // a newer call bumps seq, so a late response from an older one is dropped.
    const seq = ++seqRef.current;
    setSuggestionsOpen(false);
    setActiveIndex(-1);
    if (!trimmed) {
      setFailedQuery("");
      setError(t.dashboard.search.noQuery);
      setPhase("error");
      return;
    }
    setFailedQuery(trimmed);
    if (page === 1) {
      setPhase("loading");
      setError("");
      setNearbyError("");
    } else {
      setLoadingMore(true);
    }
    try {
      const data = await searchApi.search({
        q: trimmed,
        lat: location?.lat,
        lng: location?.lng,
        radius_km: location && filters.radiusKm !== null ? filters.radiusKm : undefined,
        dosage_form: filters.dosageForm || undefined,
        status: filters.stockStatus === "all" ? undefined : filters.stockStatus,
        page,
        limit: RESULTS_PER_PAGE,
      });
      if (seqRef.current !== seq) return; // superseded by a newer search
      if (page === 1) {
        setResults(data.results);
        setNearby(data.nearby ?? []);
        setSubmittedQuery(trimmed);
      } else {
        setResults((previous) => [...previous, ...data.results]);
      }
      setPagination({ page: data.pagination.page, total: data.pagination.total });
      setPhase("success");
    } catch (err) {
      if (seqRef.current !== seq) return;
      setError(getErrorMessage(err, t));
      setPhase("error");
    } finally {
      setLoadingMore(false);
    }
  }

  function startSearch(term: string, medicineId: string | null) {
    setSubmittedMedicineId(medicineId);
    void runSearch(term, 1);
  }

  function selectSuggestion(suggestion: MedicineSuggestion) {
    skipSuggestionsRef.current = true;
    setQuery(suggestion.display_name);
    setSuggestionsOpen(false);
    setActiveIndex(-1);
    startSearch(suggestion.display_name, suggestion.medicine_id);
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    if (!value.trim()) {
      seqRef.current += 1;
      setSuggestions([]);
      setSuggestionsOpen(false);
      setSuggestionsLoading(false);
      setActiveIndex(-1);
    }
    if (phase === "success" || phase === "error") {
      setResults([]);
      setNearby([]);
      setError("");
      setPhase("idle");
    }
  }

  function handleClear() {
    seqRef.current += 1;
    skipSuggestionsRef.current = false;
    setQuery("");
    setPhase("idle");
    setError("");
    setResults([]);
    setNearby([]);
    setNearbyError("");
    setSubmittedQuery("");
    setSubmittedMedicineId(null);
    setFailedQuery("");
    setSuggestionsOpen(false);
    setActiveIndex(-1);
  }

  // Promise wrapper around geolocation so both the filters and notify-me can await it.
  function acquireLocation(): Promise<Location | null> {
    return new Promise((resolve) => {
      if (!("geolocation" in navigator)) {
        setLocationError("failed");
        resolve(null);
        return;
      }
      setLocating(true);
      setLocationError(null);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocating(false);
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
          setLocation(loc);
          resolve(loc);
        },
        (positionError) => {
          setLocating(false);
          setLocationError(positionError.code === 1 ? "denied" : "failed");
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
      );
    });
  }

  function handleUseLocation() {
    if (locating) return;
    void acquireLocation();
  }

  function clearLocation() {
    setLocation(null);
    // Radius means nothing without a location; drop it so it isn't stale on re-enable.
    setFilters((f) => (f.radiusKm === null ? f : { ...f, radiusKm: null }));
  }

  async function loadFallbackNearby() {
    setNearbyError("");
    const loc = location ?? (await acquireLocation());
    if (!loc) return; // acquireLocation surfaced the permission error already
    setNearbyLoading(true);
    try {
      setNearby(await searchApi.nearbyFallback(loc.lat, loc.lng));
    } catch (err) {
      setNearbyError(getErrorMessage(err, t));
    } finally {
      setNearbyLoading(false);
    }
  }

  async function toggleNotify(medicineId: string) {
    if (notifyPending.has(medicineId)) return;
    setNotifyError((m) => {
      if (!m.has(medicineId)) return m;
      const next = new Map(m);
      next.delete(medicineId);
      return next;
    });
    const existing = subs.get(medicineId);
    setNotifyPending((s) => new Set(s).add(medicineId));
    try {
      if (existing) {
        await notifyApi.unsubscribe(existing);
        setSubs((m) => {
          const next = new Map(m);
          next.delete(medicineId);
          return next;
        });
      } else {
        const loc = location ?? (await acquireLocation());
        if (!loc) {
          setNotifyError((m) => new Map(m).set(medicineId, t.dashboard.search.notify.needLocation));
          return;
        }
        const res = await notifyApi.subscribe(medicineId, {
          lat: loc.lat,
          lng: loc.lng,
          radiusKm: filters.radiusKm ?? undefined,
        });
        setSubs((m) => new Map(m).set(medicineId, res.subscription_id));
      }
    } catch (err) {
      setNotifyError((m) => new Map(m).set(medicineId, getErrorMessage(err, t)));
    } finally {
      setNotifyPending((s) => {
        const next = new Set(s);
        next.delete(medicineId);
        return next;
      });
    }
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      if (!suggestionsOpen || suggestions.length === 0) return;
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      if (!suggestionsOpen || suggestions.length === 0) return;
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (suggestionsOpen && activeIndex >= 0 && suggestions[activeIndex]) {
        selectSuggestion(suggestions[activeIndex]);
      } else {
        startSearch(query, null);
      }
    } else if (event.key === "Escape") {
      setSuggestionsOpen(false);
      setActiveIndex(-1);
    }
  }

  const statusText =
    phase === "success" && results.length > 0
      ? interpolate(t.dashboard.search.showingMedicines, {
          medicines: String(groups.length),
          shown: String(results.length),
          total: String(pagination.total),
        })
      : phase === "success"
        ? t.dashboard.search.empty.title
        : "";

  return (
    <section aria-label={t.dashboard.search.label} className={"space-y-4"}>
      <Card className={"p-4 sm:p-5"}>
        <label htmlFor={inputId} className={"mb-2 block text-sm font-medium"}>
          {t.dashboard.search.inputLabel}
        </label>
        <div className={"relative"}>
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-lg border border-input bg-card p-1.5 pl-3.5",
              "transition-colors focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20",
            )}
          >
            <Search className={"pointer-events-none size-5 shrink-0 text-muted-foreground"} aria-hidden />
            <Input
              id={inputId}
              type={"text"}
              value={query}
              onChange={(event) => handleQueryChange(event.target.value)}
              onKeyDown={handleInputKeyDown}
              onFocus={() => {
                if (query.trim() && !suggestionsOpen) setSuggestionsOpen(true);
              }}
              onBlur={() => {
                window.setTimeout(() => {
                  setSuggestionsOpen(false);
                  setActiveIndex(-1);
                }, 150);
              }}
              role={"combobox"}
              aria-expanded={suggestionsOpen}
              aria-controls={listboxId}
              aria-autocomplete={"list"}
              aria-activedescendant={
                activeIndex >= 0 ? listboxId + "-option-" + activeIndex : undefined
              }
              aria-label={t.dashboard.search.inputLabel}
              placeholder={t.dashboard.search.placeholder}
              autoComplete={"off"}
              enterKeyHint={"search"}
              className={"h-11 min-w-0 flex-1 rounded-md border-0 bg-transparent px-0 text-base outline-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0"}
            />
            {query && (
              <button
                type={"button"}
                onClick={handleClear}
                aria-label={t.dashboard.search.clearSearch}
                className={"grid size-11 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"}
              >
                <X className={"size-4"} aria-hidden />
              </button>
            )}
            {suggestionsOpen && (
              <ul
                id={listboxId}
                role={"listbox"}
                aria-label={t.dashboard.search.inputLabel}
                className={"absolute inset-x-0 z-30 mt-1.5 max-h-72 overflow-y-auto rounded-lg border border-border bg-card py-1 shadow-lg"}
              >
                {suggestionsLoading && (
                  <li
                    role={"status"}
                    className={"flex min-h-11 items-center gap-2 px-3.5 text-sm text-muted-foreground"}
                  >
                    <LoaderCircle className={"size-4 animate-spin"} aria-hidden />
                    {t.dashboard.search.suggestionsLoading}
                  </li>
                )}
                {!suggestionsLoading && suggestions.length === 0 && (
                  <li className={"flex min-h-11 items-center px-3.5 text-sm text-muted-foreground"}>
                    {t.dashboard.search.noSuggestions}
                  </li>
                )}
                {!suggestionsLoading &&
                  suggestions.map((suggestion, index) => (
                    <li
                      key={suggestion.medicine_id}
                      id={listboxId + "-option-" + index}
                      role={"option"}
                      aria-selected={activeIndex === index}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectSuggestion(suggestion)}
                      className={cn(
                        "flex min-h-11 cursor-pointer items-center gap-2 px-3.5 text-sm text-foreground transition-colors",
                        activeIndex === index ? "bg-muted" : "hover:bg-muted",
                      )}
                    >
                      <span className={"min-w-0 flex-1 truncate"}>{suggestion.display_name}</span>
                      {suggestionDetail(suggestion) ? (
                        <span className={"max-w-[45%] shrink-0 truncate text-xs text-muted-foreground"}>
                          {suggestionDetail(suggestion)}
                        </span>
                      ) : null}
                    </li>
                  ))}
              </ul>
            )}
            <Button
              type={"button"}
              size={"md"}
              loading={phase === "loading"}
              aria-label={t.dashboard.search.submit}
              onClick={() => startSearch(query, null)}
              className={"shrink-0 px-3 sm:px-5"}
            >
              <Search className={"size-4 sm:hidden"} aria-hidden />
              <span className={"hidden sm:inline"}>{t.dashboard.search.submit}</span>
            </Button>
          </div>
        </div>

        {/* Quiet control row: location, filters, and (before the first search) examples.
            Filters open on demand so the collapsed hero stays three lines tall. */}
        <div className={"mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-2"}>
          {location ? (
            <button
              type={"button"}
              onClick={clearLocation}
              aria-label={t.dashboard.search.location.turnOff}
              className={"inline-flex h-9 items-center gap-1.5 rounded-full bg-primary-subtle px-3 text-xs font-medium text-primary-strong transition-colors hover:bg-primary/30"}
            >
              <LocateFixed className={"size-3.5"} aria-hidden />
              {t.dashboard.search.location.on}
              <X className={"size-3.5"} aria-hidden />
            </button>
          ) : (
            <button
              type={"button"}
              onClick={handleUseLocation}
              disabled={locating}
              className={"inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary-subtle hover:text-primary-strong disabled:opacity-60"}
            >
              {locating ? (
                <LoaderCircle className={"size-3.5 animate-spin"} aria-hidden />
              ) : (
                <LocateFixed className={"size-3.5"} aria-hidden />
              )}
              {locating ? t.dashboard.search.location.locating : t.dashboard.search.location.use}
            </button>
          )}

          <button
            type={"button"}
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            aria-controls={filtersPanelId}
            aria-label={
              activeFilters > 0
                ? interpolate(filtersT.activeCountLabel, { count: activeFilters })
                : undefined
            }
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors",
              filtersOpen || activeFilters > 0
                ? "border-primary/40 bg-primary-subtle text-primary-strong"
                : "border-border text-muted-foreground hover:border-primary/40 hover:bg-primary-subtle hover:text-primary-strong",
            )}
          >
            <SlidersHorizontal className={"size-3.5"} aria-hidden />
            {filtersT.label}
            {activeFilters > 0 && (
              <span
                aria-hidden
                className={"grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[0.6875rem] font-semibold leading-none text-primary-foreground"}
              >
                {activeFilters}
              </span>
            )}
            <ChevronDown
              className={cn("size-3.5 transition-transform", filtersOpen && "rotate-180")}
              aria-hidden
            />
          </button>

          {activeFilters > 0 && (
            <button
              type={"button"}
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className={"inline-flex h-9 items-center gap-1 rounded-full px-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:underline hover:underline-offset-4"}
            >
              <X className={"size-3.5"} aria-hidden />
              {filtersT.clear}
            </button>
          )}

          {locationError && (
            <span role={"alert"} className={"text-xs font-medium text-danger"}>
              {locationError === "denied"
                ? t.dashboard.search.location.denied
                : t.dashboard.search.location.failed}
            </span>
          )}

          {phase === "idle" && (
            <div className={"ml-auto flex flex-wrap items-center gap-x-1 gap-y-1"}>
              <span className={"px-1 text-xs text-muted-foreground"}>
                {t.dashboard.search.exampleLabel}
              </span>
              {t.dashboard.search.examples.map((example) => (
                <button
                  key={example}
                  type={"button"}
                  onClick={() => {
                    skipSuggestionsRef.current = true;
                    setQuery(example);
                    startSearch(example, null);
                  }}
                  className={"inline-flex h-9 items-center rounded-full px-2.5 text-xs font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary-strong hover:decoration-primary-strong"}
                >
                  {example}
                </button>
              ))}
            </div>
          )}
        </div>

        <div
          id={filtersPanelId}
          hidden={!filtersOpen}
          className={"mt-4 border-t border-border pt-4"}
        >
          <FiltersBar value={filters} onChange={setFilters} locationOn={location !== null} t={t} />
        </div>
      </Card>

      <p className={"sr-only"} role={"status"}>
        {statusText}
      </p>

      {phase === "loading" && (
        <Card
          role={"status"}
          aria-label={t.dashboard.search.searching}
          className={"overflow-hidden"}
        >
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={"animate-pulse px-4 py-4 sm:px-5 [&+&]:border-t [&+&]:border-border"}
            >
              <div className={"h-4 w-2/5 rounded bg-muted"} />
              <div className={"mt-2.5 h-3 w-3/5 rounded bg-muted"} />
              <div className={"mt-2.5 h-3 w-1/3 rounded bg-muted"} />
            </div>
          ))}
        </Card>
      )}

      {phase === "error" && (
        <Alert variant={"danger"}>
          <div className={"flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"}>
            <span>{error || t.dashboard.search.noQuery}</span>
            <Button
              type={"button"}
              variant={"outline"}
              size={"sm"}
              onClick={() => void runSearch(failedQuery || query)}
            >
              {t.dashboard.search.retry}
            </Button>
          </div>
        </Alert>
      )}

      {phase === "success" && results.length > 0 && (
        <div className={"space-y-4"}>
          <div className={"flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"}>
            <h2 className={"text-lg font-semibold tracking-tight"}>
              {interpolate(t.dashboard.search.resultsFor, { query: submittedQuery })}
            </h2>
            <p className={"text-xs text-muted-foreground"}>
              {interpolate(t.dashboard.search.showingMedicines, {
                medicines: String(groups.length),
                shown: String(results.length),
                total: String(pagination.total),
              })}
            </p>
          </div>
          <div className={"space-y-4"}>
            {groups.map((group) => (
              <MedicineGroupCard
                key={group.medicine_id}
                group={group}
                time={time}
                t={t}
                subscribed={subs.has(group.medicine_id)}
                notifyPending={notifyPending.has(group.medicine_id)}
                notifyError={notifyError.get(group.medicine_id)}
                onToggleNotify={toggleNotify}
                location={location}
                ensureLocation={acquireLocation}
              />
            ))}
          </div>
          {pagination.total > results.length && (
            <div className={"flex justify-center pt-2"}>
              <Button
                type={"button"}
                variant={"outline"}
                loading={loadingMore}
                onClick={() => void runSearch(submittedQuery, pagination.page + 1)}
              >
                {t.dashboard.search.showMore}
              </Button>
            </div>
          )}
        </div>
      )}

      {phase === "success" && results.length === 0 && (
        <div className={"space-y-4"}>
          <Card variant={"elevated"} className={"p-6 text-center sm:p-8"}>
            <div className={"mx-auto flex flex-col items-center"}>
              <span
                className={"flex size-12 items-center justify-center rounded-full bg-primary-subtle text-primary-strong"}
              >
                <Search className={"size-6"} aria-hidden />
              </span>
              <h2 className={"mt-4 font-semibold"}>{t.dashboard.search.empty.title}</h2>
              <p className={"mt-1 max-w-sm text-sm text-muted-foreground"}>
                {t.dashboard.search.empty.body}
              </p>
              <p className={"mt-1 max-w-sm text-sm text-muted-foreground"}>
                {location ? t.dashboard.search.empty.tryDifferent : t.dashboard.search.empty.noLocation}
              </p>
              {submittedMedicineId && (
                <div className={"mt-5 w-full max-w-sm border-t border-border pt-5"}>
                  <p className={"mb-3 text-sm text-foreground"}>
                    {t.dashboard.search.notify.emptyPrompt}
                  </p>
                  <NotifyButton
                    subscribed={subs.has(submittedMedicineId)}
                    pending={notifyPending.has(submittedMedicineId)}
                    error={notifyError.get(submittedMedicineId)}
                    onToggle={() => toggleNotify(submittedMedicineId)}
                    t={t}
                  />
                </div>
              )}
            </div>
          </Card>

          {nearby.length > 0 ? (
            <div className={"space-y-3"}>
              <div>
                <h2 className={"text-lg font-semibold tracking-tight"}>
                  {t.dashboard.search.nearby.title}
                </h2>
                <p className={"mt-1 text-sm text-muted-foreground"}>
                  {t.dashboard.search.nearby.body}
                </p>
              </div>
              <NearbyList pharmacies={nearby} t={t} />
            </div>
          ) : !location ? (
            <div className={"space-y-2"}>
              <Button
                type={"button"}
                variant={"outline"}
                loading={locating || nearbyLoading}
                onClick={() => void loadFallbackNearby()}
              >
                {!locating && !nearbyLoading && <LocateFixed className={"size-4"} aria-hidden />}
                {nearbyLoading ? t.dashboard.search.nearby.loading : t.dashboard.search.nearby.useLocation}
              </Button>
              {nearbyError && (
                <p role={"alert"} className={"text-xs font-medium text-danger"}>
                  {nearbyError}
                </p>
              )}
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
