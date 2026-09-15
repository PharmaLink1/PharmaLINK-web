"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { analyticsApi, pharmacyApi } from "@/lib/pharmacy-api";
import type { AnalyticsPeriod, MyPharmacy, PharmacyAnalytics } from "@/lib/pharmacy-types";
import { interpolate, useLanguage } from "@/lib/i18n";
import { getErrorMessage } from "@/lib/i18n/errors";
import { Alert } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Spinner } from "@/components/ui/spinner";
import { AppHeader } from "@/components/layout/app-header";
import { cn } from "@/lib/cn";

/** Look-back windows the backend accepts. Anything else is rejected as
 * INVALID_PERIOD, so the control offers exactly these. */
const PERIODS: AnalyticsPeriod[] = ["7d", "30d", "90d"];

type Phase = "loading" | "ready" | "error";

/**
 * Pharmacist demand report: what patients searched for near the selected pharmacy that
 * it cannot currently sell, busiest first. A pharmacist may own several pharmacies, so
 * when there's more than one they pick which to report on (deep-linkable from a
 * pharmacy card via ?pharmacy=<id>).
 *
 * The backend scopes demand to a radius around the pharmacy's own coordinates, so a
 * pharmacy with no location on record cannot produce a report - that arrives as
 * PHARMACY_LOCATION_UNKNOWN and is shown as its own message.
 */
export function AnalyticsContent() {
  const { t } = useLanguage();
  const a = t.dashboard.analytics;

  const [pharmacies, setPharmacies] = React.useState<MyPharmacy[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [ready, setReady] = React.useState(false);
  const [period, setPeriod] = React.useState<AnalyticsPeriod>("30d");
  const [phase, setPhase] = React.useState<Phase>("loading");
  const [analytics, setAnalytics] = React.useState<PharmacyAnalytics | null>(null);
  const [error, setError] = React.useState("");
  const [attempt, setAttempt] = React.useState(0);

  const selected = React.useMemo(
    () => pharmacies.find((p) => p.pharmacy_id === selectedId) ?? null,
    [pharmacies, selectedId],
  );

  // Resolve the pharmacist's pharmacies first; the report needs one of their ids. The
  // initial pharmacy comes from ?pharmacy=<id> when it matches one they own.
  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const mine = await pharmacyApi.listMine();
        if (!active) return;
        setPharmacies(mine);
        const wanted = new URLSearchParams(window.location.search).get("pharmacy");
        // Keep whichever pharmacy is already chosen - a retry must not jump back to
        // the first one - then fall back to the deep link, then to the first pharmacy.
        setSelectedId((current) => {
          const keep = mine.find((p) => p.pharmacy_id === (current ?? wanted));
          return (keep ?? mine[0])?.pharmacy_id ?? null;
        });
        // With no pharmacy there is nothing to report on, so leave the loading state.
        if (mine.length === 0) setPhase("ready");
      } catch (err) {
        if (!active) return;
        setError(getErrorMessage(err, t));
        setPhase("error");
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [t, attempt]);

  // Load the report whenever the pharmacy or the window changes. Nothing is set before
  // the first await: the loading state is already on, set by whichever control changed.
  React.useEffect(() => {
    if (!selectedId) return;
    let active = true;
    (async () => {
      try {
        const data = await analyticsApi.demand(selectedId, period);
        if (!active) return;
        setAnalytics(data);
        setError("");
        setPhase("ready");
      } catch (err) {
        if (!active) return;
        setError(getErrorMessage(err, t));
        setPhase("error");
      }
    })();
    return () => {
      active = false;
    };
  }, [selectedId, period, attempt, t]);

  function handleSelectPharmacy(id: string) {
    if (id === selectedId) return;
    setSelectedId(id);
    setError("");
    setPhase("loading");
  }

  function handleSelectPeriod(next: AnalyticsPeriod) {
    if (next === period) return;
    setPeriod(next);
    setError("");
    setPhase("loading");
  }

  // Re-runs the report after a failure. Bumping the attempt is what re-triggers the
  // effect, so a link back to the same URL would not have been enough.
  function retry() {
    setError("");
    setPhase("loading");
    setAttempt((n) => n + 1);
  }

  // Labels for exactly the windows the backend accepts, so the control can never
  // offer one it would reject.
  const periodLabels: Record<AnalyticsPeriod, string> = {
    "7d": a.period7d,
    "30d": a.period30d,
    "90d": a.period90d,
  };

  const items = analytics?.unmetDemand ?? [];
  // The report is ranked, so the top count is the busiest and makes the fullest bar.
  const busiest = items.length > 0 ? items[0].searchCount : 0;

  return (
    <div className={"flex min-h-dvh flex-col"}>
      <AppHeader />

      <main className={"mx-auto w-full max-w-3xl flex-1 px-6 py-10"}>
        <Link
          href={"/dashboard"}
          className={"inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"}
        >
          <ArrowLeft className={"size-4"} aria-hidden />
          {t.nav.dashboard}
        </Link>

        <h1 className={"mt-4 text-2xl font-semibold tracking-tight"}>{a.title}</h1>
        <p className={"mt-1 text-muted-foreground"}>{a.subtitle}</p>

        {!ready ? (
          <div className={"mt-8 flex justify-center py-10"}>
            <Spinner label={a.loading} />
          </div>
        ) : !selected ? (
          error ? (
            <div className={"mt-6"}>
              <Alert variant={"danger"}>
                <div className={"flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"}>
                  <span>{error}</span>
                  <Button type={"button"} variant={"outline"} size={"sm"} onClick={retry}>
                    {a.retry}
                  </Button>
                </div>
              </Alert>
            </div>
          ) : (
            <Card className={"mt-8 p-5"}>
              <p className={"text-sm text-muted-foreground"}>{a.noPharmacy}</p>
              <div className={"mt-4"}>
                <Link
                  href={"/dashboard/pharmacy"}
                  className={cn(buttonVariants({ variant: "primary", size: "sm" }))}
                >
                  {t.dashboard.pharmacy.register}
                </Link>
              </div>
            </Card>
          )
        ) : (
          <div className={"mt-6 space-y-4"}>
            {pharmacies.length > 1 && (
              <Field label={a.pharmacyLabel} htmlFor={"analytics-pharmacy"} hint={a.selectPharmacyHint}>
                <select
                  id={"analytics-pharmacy"}
                  value={selected.pharmacy_id}
                  onChange={(e) => handleSelectPharmacy(e.target.value)}
                  className={cn(
                    "h-11 w-full rounded-md border border-input bg-card px-3.5 text-sm text-foreground",
                    "transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                  )}
                >
                  {pharmacies.map((ph) => (
                    <option key={ph.pharmacy_id} value={ph.pharmacy_id}>
                      {ph.name}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <div className={"flex flex-col gap-1.5"}>
              <span className={"text-sm font-medium text-foreground"}>{a.periodLabel}</span>
              <SegmentedControl<AnalyticsPeriod>
                ariaLabel={a.periodLabel}
                value={period}
                onChange={handleSelectPeriod}
                options={PERIODS.map((value) => ({ value, label: periodLabels[value] }))}
              />
            </div>

            {error && (
              <Alert variant={"danger"}>
                <div className={"flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"}>
                  <span>{error}</span>
                  <Button type={"button"} variant={"outline"} size={"sm"} onClick={retry}>
                    {a.retry}
                  </Button>
                </div>
              </Alert>
            )}

            {phase === "loading" && !error && (
              <div className={"flex justify-center py-10"}>
                <Spinner label={a.loading} />
              </div>
            )}

            {phase === "ready" && !error && items.length === 0 && (
              <Card className={"flex flex-col items-center gap-3 p-8 text-center"}>
                <span className={"flex size-12 items-center justify-center rounded-full bg-primary-subtle text-primary-strong"}>
                  <TrendingUp className={"size-6"} aria-hidden />
                </span>
                <h2 className={"font-semibold"}>{a.emptyTitle}</h2>
                <p className={"max-w-sm text-sm text-muted-foreground"}>{a.emptyBody}</p>
              </Card>
            )}

            {phase === "ready" && !error && items.length > 0 && (
              <div className={"space-y-2"}>
                <h2 className={"font-semibold text-foreground"}>{a.listHeader}</h2>
                <p className={"text-xs text-muted-foreground"}>{a.listHint}</p>

                <Card className={"overflow-hidden"}>
                  <ul className={"divide-y divide-border"}>
                    {items.map((item) => (
                      <UnmetDemandRow
                        key={item.medicineId}
                        name={item.medicineName || item.medicineId}
                        count={item.searchCount}
                        busiest={busiest}
                      />
                    ))}
                  </ul>
                </Card>

                <div className={"flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between"}>
                  <p className={"text-xs text-muted-foreground"}>
                    {interpolate(a.count, { count: items.length })}
                  </p>
                  <Link
                    href={"/dashboard/inventory?pharmacy=" + encodeURIComponent(selected.pharmacy_id)}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "sm:w-auto")}
                  >
                    {a.manageInventory}
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

/** One medicine patients wanted but could not get here. The bar is relative to the
 * busiest medicine in the current window, so it compares rows rather than time. */
function UnmetDemandRow({
  name,
  count,
  busiest,
}: {
  name: string;
  count: number;
  busiest: number;
}) {
  const { t } = useLanguage();
  const a = t.dashboard.analytics;
  const width = busiest > 0 ? Math.max(4, Math.round((count / busiest) * 100)) : 0;

  return (
    <li className={"px-4 py-3.5"}>
      <div className={"flex items-baseline justify-between gap-3"}>
        <p className={"min-w-0 truncate text-sm font-medium text-foreground"}>{name}</p>
        <span className={"shrink-0 text-xs tabular-nums text-muted-foreground"}>
          {interpolate(count === 1 ? a.searchesOne : a.searchesOther, { count })}
        </span>
      </div>
      <div aria-hidden={"true"} className={"mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted"}>
        <div className={"h-full rounded-full bg-primary"} style={{ width: width + "%" }} />
      </div>
    </li>
  );
}
