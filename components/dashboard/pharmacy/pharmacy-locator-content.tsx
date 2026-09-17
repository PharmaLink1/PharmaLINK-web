"use client";

import * as React from "react";
import Link from "next/link";
import { Clock, MapPin, Navigation, Phone } from "lucide-react";
import { pharmacyApi } from "@/lib/pharmacy-api";
import type { PharmacyListItem } from "@/lib/pharmacy-types";
import { useLanguage, interpolate } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { getErrorMessage } from "@/lib/i18n/errors";
import { directionsUrl, formatDistanceMeters } from "@/lib/search-format";
import { Alert } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { AppHeader } from "@/components/layout/app-header";
import { VerifiedBadge } from "@/components/dashboard/pharmacy/verified-badge";
import { cn } from "@/lib/cn";

type Status = "idle" | "locating" | "loading" | "error" | "ready";
type LocatorStrings = Dictionary["dashboard"]["locator"];

/** Patient-facing "pharmacies near you" locator (GET /pharmacies, public). Location is
 * opt-in — mirroring medicine search — then verified pharmacies come back sorted by
 * distance. "Open now" is filtered client-side on each item's server-computed
 * is_open_now (already correct for East Africa Time), so toggling it needs no refetch. */
export function PharmacyLocatorContent() {
  const { t } = useLanguage();
  const d = t.dashboard.locator;

  const [status, setStatus] = React.useState<Status>("idle");
  const [pharmacies, setPharmacies] = React.useState<PharmacyListItem[]>([]);
  const [error, setError] = React.useState("");
  const [locationError, setLocationError] = React.useState<"denied" | "failed" | null>(null);
  const [openNowOnly, setOpenNowOnly] = React.useState(false);

  const fetchNearby = React.useCallback(
    async (loc: { lat: number; lng: number }) => {
      setStatus("loading");
      setError("");
      try {
        setPharmacies(await pharmacyApi.listNearby(loc));
        setStatus("ready");
      } catch (err) {
        setError(getErrorMessage(err, t));
        setStatus("error");
      }
    },
    [t],
  );

  // Opt-in geolocation, mirroring medicine-search's acquireLocation (denied vs failed).
  const useMyLocation = React.useCallback(() => {
    if (status === "locating") return;
    if (!("geolocation" in navigator)) {
      setLocationError("failed");
      setStatus("error");
      return;
    }
    setLocationError(null);
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        void fetchNearby({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      (positionError) => {
        setLocationError(positionError.code === 1 ? "denied" : "failed");
        setStatus("error");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  }, [status, fetchNearby]);

  const visible = openNowOnly ? pharmacies.filter((p) => p.is_open_now) : pharmacies;

  return (
    <div className={"flex min-h-dvh flex-col"}>
      <AppHeader />

      <main className={"mx-auto w-full max-w-3xl flex-1 px-6 py-10"}>
        <header>
          <h1 className={"text-2xl font-semibold tracking-tight"}>{d.title}</h1>
          <p className={"mt-1 text-muted-foreground"}>{d.subtitle}</p>
        </header>

        <div className={"mt-8"}>
          {status === "idle" && (
            <Card className={"flex flex-col items-center gap-4 p-8 text-center"}>
              <span className={"flex size-12 items-center justify-center rounded-full bg-primary-subtle text-primary-strong"}>
                <MapPin className={"size-6"} aria-hidden />
              </span>
              <p className={"max-w-sm text-sm text-muted-foreground"}>{d.intro}</p>
              <Button type={"button"} onClick={useMyLocation}>
                <Navigation className={"size-4"} aria-hidden />
                {d.useLocation}
              </Button>
            </Card>
          )}

          {(status === "locating" || status === "loading") && (
            <div className={"flex justify-center py-16"}>
              <Spinner label={status === "locating" ? d.locating : d.loading} />
            </div>
          )}

          {status === "error" && (
            <Alert variant={"danger"}>
              <div className={"flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"}>
                <span>
                  {locationError === "denied"
                    ? d.locationDenied
                    : locationError === "failed"
                      ? d.locationFailed
                      : error || d.error}
                </span>
                <Button type={"button"} variant={"outline"} size={"sm"} onClick={useMyLocation}>
                  {d.retry}
                </Button>
              </div>
            </Alert>
          )}

          {status === "ready" && (
            <div className={"space-y-4"}>
              {pharmacies.length > 0 && (
                <div className={"flex items-center justify-between gap-3"}>
                  <p className={"text-sm text-muted-foreground"} aria-live={"polite"}>
                    {visible.length} {visible.length === 1 ? d.resultOne : d.resultMany}
                  </p>
                  <button
                    type={"button"}
                    onClick={() => setOpenNowOnly((v) => !v)}
                    aria-pressed={openNowOnly}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      openNowOnly
                        ? "border-primary bg-primary-subtle text-primary-strong"
                        : "border-border text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <Clock className={"size-3.5"} aria-hidden />
                    {d.openNowOnly}
                  </button>
                </div>
              )}

              {visible.length === 0 ? (
                <Card className={"p-8 text-center"}>
                  {openNowOnly && pharmacies.length > 0 ? (
                    <p className={"text-sm text-muted-foreground"}>{d.emptyOpenNow}</p>
                  ) : (
                    <>
                      <p className={"font-medium text-foreground"}>{d.empty.title}</p>
                      <p className={"mt-1 text-sm text-muted-foreground"}>{d.empty.body}</p>
                    </>
                  )}
                </Card>
              ) : (
                <Card className={"overflow-hidden"}>
                  <ul className={"divide-y divide-border"}>
                    {visible.map((pharmacy) => (
                      <LocatorRow key={pharmacy.pharmacy_id} pharmacy={pharmacy} d={d} t={t} />
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function LocatorRow({
  pharmacy,
  d,
  t,
}: {
  pharmacy: PharmacyListItem;
  d: LocatorStrings;
  t: Dictionary;
}) {
  // hours_today is an English label from the backend; when it's just "Closed" it repeats
  // the status badge, so only a real span ("08:00-21:00", "24 Hours") is worth showing.
  const hoursToday =
    pharmacy.hours_today && pharmacy.hours_today.toLowerCase() !== "closed"
      ? pharmacy.hours_today
      : null;

  return (
    <li
      className={cn(
        "group relative px-3.5 py-3 transition-colors sm:px-5 sm:py-4",
        "hover:bg-muted/60 focus-within:bg-muted/60",
      )}
    >
      <div className={"flex flex-col items-stretch gap-2 sm:flex-row sm:items-start sm:gap-4"}>
        {/* Image-free identity mark: first letter of the pharmacy name. */}
        <span
          className={
            "mt-0.5 hidden size-10 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-base font-semibold text-primary-strong sm:flex"
          }
          aria-hidden
        >
          {pharmacy.name.trim().charAt(0) || "?"}
        </span>

        <div className={"min-w-0 flex-1"}>
          <div className={"flex flex-wrap items-center gap-x-2 gap-y-1"}>
            <Link
              href={"/dashboard/pharmacies/" + pharmacy.pharmacy_id}
              className={"rounded text-sm font-semibold text-foreground hover:underline sm:text-base"}
            >
              {pharmacy.name}
            </Link>
            {pharmacy.verified_status === "verified" && (
              <VerifiedBadge status={pharmacy.verified_status} t={t} />
            )}
          </div>

          <div className={"mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs"}>
            <span
              className={cn(
                "font-medium",
                pharmacy.is_open_now ? "text-success" : "text-muted-foreground",
              )}
            >
              {pharmacy.is_open_now ? d.openNow : d.closedNow}
            </span>
            <span className={"text-muted-foreground"} aria-hidden>
              ·
            </span>
            <span className={"inline-flex items-center gap-1 text-muted-foreground"}>
              <Navigation className={"size-3"} aria-hidden />
              <span className={"tabular-nums font-medium text-foreground"}>
                {formatDistanceMeters(pharmacy.distance_m)}
              </span>
            </span>
            {hoursToday ? (
              <>
                <span className={"text-muted-foreground"} aria-hidden>
                  ·
                </span>
                <span className={"tabular-nums text-muted-foreground"}>{hoursToday}</span>
              </>
            ) : null}
          </div>

          {pharmacy.address ? (
            <p className={"mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"}>
              <MapPin className={"size-3 shrink-0"} aria-hidden />
              <span className={"truncate"}>{pharmacy.address}</span>
            </p>
          ) : null}

          <p className={"mt-1 hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex"}>
            <Phone className={"size-3.5 shrink-0"} aria-hidden />
            {pharmacy.phone ? (
              <span className={"tabular-nums"} dir={"ltr"}>
                {pharmacy.phone}
              </span>
            ) : (
              <span>{d.noPhone}</span>
            )}
          </p>
        </div>

        <div
          className={
            "relative z-10 flex shrink-0 flex-wrap items-center gap-2"
          }
        >
          <a
            href={directionsUrl(pharmacy.lat, pharmacy.lng)}
            target={"_blank"}
            rel={"noreferrer"}
            className={cn(buttonVariants({ size: "sm" }), "h-11 px-3 text-xs sm:h-9 sm:text-sm")}
          >
            <Navigation className={"size-4"} aria-hidden />
            {d.directions}
          </a>
          {pharmacy.phone ? (
            <a
              href={"tel:" + pharmacy.phone}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-11 px-3 text-xs sm:h-9 sm:text-sm")}
              aria-label={interpolate(d.callAria, { name: pharmacy.name })}
            >
              <Phone className={"size-4"} aria-hidden />
              {d.call}
            </a>
          ) : null}
        </div>
      </div>

      {/* Stretched-link affordance: the whole row is clickable to the detail page,
          while the Directions/Call buttons stay independently tappable. */}
      <Link
        href={"/dashboard/pharmacies/" + pharmacy.pharmacy_id}
        className={"absolute inset-0 rounded focus-visible:outline-none"}
        aria-label={pharmacy.name}
      >
        <span className={"sr-only"}>{pharmacy.name}</span>
      </Link>
    </li>
  );
}
