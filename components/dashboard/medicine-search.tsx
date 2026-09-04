"use client";

import * as React from "react";
import { LoaderCircle, LocateFixed, Search, X } from "lucide-react";
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

  const groups = React.useMemo(() => groupByMedicine(results), [results]);

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
        <div className={"flex flex-col gap-2 sm:flex-row sm:items-end"}>
          <div className={"min-w-0 flex-1"}>
            <label htmlFor={inputId} className={"mb-1.5 block text-sm font-medium text-foreground"}>
              {t.dashboard.search.inputLabel}
            </label>
            <div className={"relative"}>
              <Search
                className={"pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"}
                aria-hidden
              />
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
                className={"pl-10 pr-10"}
              />
              {query && (
                <button
                  type={"button"}
                  onClick={handleClear}
                  aria-label={t.dashboard.search.clearSearch}
                  className={"absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"}
                >
                  <X className={"size-4"} aria-hidden />
                </button>
              )}
              {suggestionsOpen && (
                <ul
                  id={listboxId}
                  role={"listbox"}
                  aria-label={t.dashboard.search.inputLabel}
                  className={"absolute z-20 mt-1.5 max-h-72 w-full overflow-y-auto rounded-md border border-border bg-card py-1 shadow-md"}
                >
                  {suggestionsLoading && (
                    <li
                      role={"status"}
                      className={"flex items-center gap-2 px-3.5 py-2.5 text-sm text-muted-foreground"}
                    >
                      <LoaderCircle className={"size-4 animate-spin"} aria-hidden />
                      {t.dashboard.search.suggestionsLoading}
                    </li>
                  )}
                  {!suggestionsLoading && suggestions.length === 0 && (
                    <li className={"px-3.5 py-2.5 text-sm text-muted-foreground"}>
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
                          "cursor-pointer px-3.5 py-2.5 text-sm text-foreground",
                          activeIndex === index ? "bg-muted" : undefined,
                        )}
                      >
                        <span className={"block truncate"}>{suggestion.display_name}</span>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>
          <Button
            type={"button"}
            onClick={() => startSearch(query, null)}
            disabled={phase === "loading"}
            className={"w-full sm:w-auto"}
          >
            {t.dashboard.search.submit}
          </Button>
        </div>

        <div className={"mt-4 flex flex-wrap items-center gap-x-4 gap-y-2.5"}>
          {location ? (
            <button
              type={"button"}
              onClick={clearLocation}
              aria-label={t.dashboard.search.location.turnOff}
              className={"inline-flex items-center gap-1.5 rounded-full bg-primary-subtle px-3 py-1.5 text-xs font-medium text-primary-strong transition-colors hover:bg-primary/30"}
            >
              <LocateFixed className={"size-3.5"} aria-hidden />
              {t.dashboard.search.location.on}
              <X className={"size-3.5"} aria-hidden />
            </button>
          ) : (
            <Button
              type={"button"}
              variant={"outline"}
              size={"sm"}
              loading={locating}
              onClick={handleUseLocation}
            >
              <LocateFixed className={"size-4"} aria-hidden />
              {locating ? t.dashboard.search.location.locating : t.dashboard.search.location.use}
            </Button>
          )}
          {locationError && (
            <span role={"alert"} className={"text-xs font-medium text-danger"}>
              {locationError === "denied"
                ? t.dashboard.search.location.denied
                : t.dashboard.search.location.failed}
            </span>
          )}
          <div className={"ml-auto flex items-center gap-1.5 text-xs text-muted-foreground"}>
            <span className={"hidden sm:inline"}>{t.dashboard.search.exampleLabel}:</span>
            {t.dashboard.search.examples.map((example) => (
              <button
                key={example}
                type={"button"}
                onClick={() => {
                  skipSuggestionsRef.current = true;
                  setQuery(example);
                  startSearch(example, null);
                }}
                className={"rounded-full border border-border bg-card px-3 py-1.5 font-medium text-foreground transition-colors hover:bg-muted"}
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        <FiltersBar value={filters} onChange={setFilters} locationOn={location !== null} t={t} />
      </Card>

      <p className={"sr-only"} role={"status"}>
        {statusText}
      </p>

      {phase === "loading" && (
        <Card
          role={"status"}
          aria-label={t.dashboard.search.searching}
          className={"divide-y divide-border overflow-hidden"}
        >
          {[0, 1, 2, 3, 4].map((index) => (
            <div key={index} className={"animate-pulse px-4 py-4 sm:px-5"}>
              <div className={"h-3.5 w-2/5 rounded bg-muted"} />
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
        <div className={"space-y-3"}>
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
          <div className={"space-y-3"}>
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
              />
            ))}
          </div>
          {pagination.total > results.length && (
            <div className={"flex justify-center pt-1"}>
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
        <div className={"space-y-3"}>
          <Card className={"p-5"}>
            <h2 className={"font-semibold"}>{t.dashboard.search.empty.title}</h2>
            <p className={"mt-1 text-sm text-muted-foreground"}>{t.dashboard.search.empty.body}</p>
            <p className={"mt-1 text-sm text-muted-foreground"}>
              {location ? t.dashboard.search.empty.tryDifferent : t.dashboard.search.empty.noLocation}
            </p>
            {submittedMedicineId && (
              <div className={"mt-4 border-t border-border pt-4"}>
                <p className={"mb-2 text-sm text-foreground"}>
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
                <LocateFixed className={"size-4"} aria-hidden />
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
