"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Clock, MapPin, Phone } from "lucide-react";
import { pharmacyApi } from "@/lib/pharmacy-api";
import { ApiError } from "@/lib/auth-types";
import type { Hours, PharmacyDetail } from "@/lib/pharmacy-types";
import { useLanguage, interpolate } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { getErrorMessage } from "@/lib/i18n/errors";
import { directionsUrl } from "@/lib/search-format";
import { Alert } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { AppHeader } from "@/components/layout/app-header";
import { VerifiedBadge } from "@/components/dashboard/pharmacy/verified-badge";
import { cn } from "@/lib/cn";

type Phase = "loading" | "success" | "notfound" | "error";
type DetailStrings = Dictionary["dashboard"]["pharmacyDetail"];

// Monday-first week; keys match the backend Hours map (mon..sun).
const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
type DayKey = (typeof DAY_ORDER)[number];

// JS getDay(): 0=Sun..6=Sat → our day key, used only to emphasize "today".
const JS_DAY_TO_KEY: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

/** Renders one day's hours, localized. The backend stores locale-neutral spans
 * ("08:00-20:00"); an empty/"closed" value means closed, and is24h overrides all. */
function dayHoursLabel(hours: Hours, key: DayKey, d: DetailStrings): string {
  if (hours.is24h) return d.open24;
  const raw = (hours[key] ?? "").trim();
  if (!raw || raw.toLowerCase() === "closed") return d.closedDay;
  return raw.replace(/\s*-\s*/g, "–");
}

/** Patient-facing detail for one pharmacy (GET /pharmacies/{id}, public). Shows
 * open-now state, hours, address, and quick actions to get directions or call.
 * Reached from search results, so it lives in the authenticated app shell. */
export function PharmacyDetailContent({ id }: { id: string }) {
  const { locale, t } = useLanguage();
  const d = t.dashboard.pharmacyDetail;

  const [phase, setPhase] = React.useState<Phase>("loading");
  const [detail, setDetail] = React.useState<PharmacyDetail | null>(null);
  const [error, setError] = React.useState("");

  const load = React.useCallback(async () => {
    setPhase("loading");
    setError("");
    try {
      const data = await pharmacyApi.get(id);
      setDetail(data);
      setPhase("success");
    } catch (err) {
      // An unknown id is an expected case (stale link) — show a calm not-found card.
      if (err instanceof ApiError && err.code === "PHARMACY_NOT_FOUND") {
        setPhase("notfound");
        return;
      }
      setError(getErrorMessage(err, t));
      setPhase("error");
    }
  }, [id, t]);

  React.useEffect(() => {
    // Data-fetch effect; load() sets loading/error state synchronously so the spinner
    // shows immediately (same scoped disable as pharmacy-content / applications-review).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

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

        <div className={"mt-6"}>
          {phase === "loading" && (
            <div className={"flex justify-center py-16"}>
              <Spinner label={d.loading} />
            </div>
          )}

          {phase === "error" && (
            <Alert variant={"danger"}>
              <div className={"flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"}>
                <span>{error || d.error}</span>
                <Button type={"button"} variant={"outline"} size={"sm"} onClick={() => void load()}>
                  {d.retry}
                </Button>
              </div>
            </Alert>
          )}

          {phase === "notfound" && (
            <Card className={"p-8 text-center"}>
              <p className={"font-medium text-foreground"}>{d.notFound.title}</p>
              <p className={"mt-1 text-sm text-muted-foreground"}>{d.notFound.body}</p>
            </Card>
          )}

          {phase === "success" && detail && (
            <PharmacyDetailView detail={detail} locale={locale} t={t} />
          )}
        </div>
      </main>
    </div>
  );
}

function PharmacyDetailView({
  detail,
  locale,
  t,
}: {
  detail: PharmacyDetail;
  locale: string;
  t: Dictionary;
}) {
  const d = t.dashboard.pharmacyDetail;
  // getDay() runs only after the client-side fetch resolves (never during SSR, which
  // shows the spinner), so there is no hydration mismatch from the "today" emphasis.
  const todayKey = JS_DAY_TO_KEY[new Date().getDay()];

  const listed = React.useMemo(() => {
    const date = new Date(detail.created_at);
    return Number.isNaN(date.getTime())
      ? ""
      : date.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
  }, [detail.created_at, locale]);

  return (
    <div className={"space-y-6"}>
      <Card className={"p-5 sm:p-6"}>
        <div className={"flex flex-wrap items-start justify-between gap-3"}>
          <div className={"min-w-0"}>
            <h1 className={"text-xl font-semibold tracking-tight"}>{detail.name}</h1>
            <span
              className={cn(
                "mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                detail.is_open_now
                  ? "bg-success-subtle text-success"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <Clock className={"size-3.5"} aria-hidden />
              {detail.is_open_now ? d.openNow : d.closedNow}
            </span>
          </div>
          {detail.verified_status === "verified" && (
            <VerifiedBadge status={detail.verified_status} t={t} />
          )}
        </div>

        <div className={"mt-4 flex flex-wrap gap-2"}>
          <a
            href={directionsUrl(detail.lat, detail.lng)}
            target={"_blank"}
            rel={"noreferrer"}
            className={cn(buttonVariants({ size: "sm" }))}
          >
            <MapPin className={"size-4"} aria-hidden />
            {d.directions}
          </a>
          {detail.phone ? (
            <a
              href={"tel:" + detail.phone}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              <Phone className={"size-4"} aria-hidden />
              {d.call}
            </a>
          ) : (
            <span className={"inline-flex items-center text-xs text-muted-foreground"}>
              {d.noPhone}
            </span>
          )}
        </div>

        {detail.address ? (
          <p className={"mt-4 flex items-start gap-2 text-sm text-muted-foreground"}>
            <MapPin className={"mt-0.5 size-4 shrink-0"} aria-hidden />
            <span>{detail.address}</span>
          </p>
        ) : null}
      </Card>

      <Card className={"p-5 sm:p-6"}>
        <h2 className={"flex items-center gap-2 font-semibold tracking-tight"}>
          <Clock className={"size-4 text-primary-strong"} aria-hidden />
          {d.hoursHeading}
        </h2>
        <ul className={"mt-3 divide-y divide-border"}>
          {DAY_ORDER.map((key) => {
            const isToday = key === todayKey;
            return (
              <li
                key={key}
                className={cn("flex items-center justify-between gap-4 py-2 text-sm", isToday && "font-medium")}
              >
                <span className={isToday ? "text-foreground" : "text-muted-foreground"}>
                  {d.days[key]}
                  {isToday ? (
                    <span className={"ml-2 text-xs font-medium text-primary-strong"}>{d.today}</span>
                  ) : null}
                </span>
                <span className={cn("tabular-nums", isToday ? "text-foreground" : "text-muted-foreground")}>
                  {dayHoursLabel(detail.hours, key, d)}
                </span>
              </li>
            );
          })}
        </ul>
      </Card>

      {listed ? (
        <p className={"text-center text-xs text-muted-foreground"}>
          {interpolate(d.listedOn, { date: listed })}
        </p>
      ) : null}
    </div>
  );
}
