"use client";

import * as React from "react";
import { TriangleAlert } from "lucide-react";
import { drugInfoApi } from "@/lib/api-client";
import { ApiError } from "@/lib/auth-types";
import type { DrugInfo, InteractionSeverity } from "@/lib/drug-info-types";
import { interpolate } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { getErrorMessage } from "@/lib/i18n/errors";
import { timeAgoLabel } from "@/lib/search-format";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/cn";

type Phase = "loading" | "success" | "notfound" | "error";

// Severity styling mirrors the stock pills in search-format so warnings read at a
// glance: severe = danger, moderate = warning, minor = neutral.
const severityPillClasses: Record<InteractionSeverity, string> = {
  severe: "bg-danger-subtle text-danger",
  moderate: "bg-warning-subtle text-warning",
  minor: "bg-muted text-muted-foreground",
};

// Safety-first ordering: the most serious interactions surface at the top.
const severityRank: Record<InteractionSeverity, number> = {
  severe: 0,
  moderate: 1,
  minor: 2,
};

/** Lazy-loaded drug-info body for one medicine: plain-language summary, side
 * effects, interaction warnings, provenance, and a localized safety disclaimer.
 * Fetched when the disclosure opens; a 404 (no info yet) is an expected empty
 * state, not an error. Re-fetches on a language change so the summary follows the
 * current locale (localized server-side via Accept-Language). */
export function DrugInfoPanel({ medicineId, t }: { medicineId: string; t: Dictionary }) {
  const di = t.dashboard.drugInfo;
  const [phase, setPhase] = React.useState<Phase>("loading");
  const [info, setInfo] = React.useState<DrugInfo | null>(null);
  const [error, setError] = React.useState("");
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    let active = true;
    drugInfoApi
      .get(medicineId)
      .then((data) => {
        if (!active) return;
        setInfo(data);
        setPhase("success");
      })
      .catch((err) => {
        if (!active) return;
        // "Not available yet" is common: most medicines have no info. Render it as
        // a calm empty state rather than a red error.
        if (err instanceof ApiError && err.code === "DRUG_INFO_NOT_FOUND") {
          setPhase("notfound");
          return;
        }
        setError(getErrorMessage(err, t));
        setPhase("error");
      });
    return () => {
      active = false;
    };
  }, [medicineId, t, reloadKey]);

  if (phase === "loading") {
    return (
      <div className={"px-4 py-4 sm:px-5"}>
        <Spinner label={di.loading} />
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className={"px-4 py-4 sm:px-5"}>
        <Alert variant={"danger"}>
          <div className={"flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"}>
            <span>{error || di.error}</span>
            <Button
              type={"button"}
              variant={"outline"}
              size={"sm"}
              onClick={() => {
                setError("");
                setPhase("loading");
                setReloadKey((key) => key + 1);
              }}
            >
              {di.retry}
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  if (phase === "notfound" || !info) {
    return (
      <div className={"px-4 py-4 sm:px-5"}>
        <p className={"text-sm font-medium text-foreground"}>{di.unavailable.title}</p>
        <p className={"mt-1 text-sm text-muted-foreground"}>{di.unavailable.body}</p>
      </div>
    );
  }

  const interactions = [...info.interactions].sort(
    (a, b) => severityRank[a.severity] - severityRank[b.severity],
  );
  const sourceLabel = info.source === "official" ? di.source.official : di.source.userSubmitted;
  const ago = info.last_edited_at ? timeAgoLabel(info.last_edited_at, t.dashboard.search.time) : null;
  const updatedText = ago
    ? ago.justNow
      ? di.updatedJustNow
      : interpolate(di.updated, { time: ago.label })
    : "";

  return (
    <div className={"space-y-4 px-4 py-4 sm:px-5"}>
      {info.summary ? (
        <p className={"whitespace-pre-line text-sm leading-relaxed text-foreground"}>
          {info.summary}
        </p>
      ) : null}

      {info.side_effects.length > 0 && (
        <div>
          <h4 className={"text-sm font-semibold text-foreground"}>{di.sideEffects}</h4>
          <ul className={"mt-1.5 flex flex-wrap gap-1.5"}>
            {info.side_effects.map((effect) => (
              <li
                key={effect}
                className={"inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"}
              >
                {effect}
              </li>
            ))}
          </ul>
        </div>
      )}

      {interactions.length > 0 && (
        <div>
          <h4 className={"flex items-center gap-1.5 text-sm font-semibold text-foreground"}>
            <TriangleAlert className={"size-4 text-warning"} aria-hidden />
            {di.interactions}
          </h4>
          <ul className={"mt-2 space-y-2"}>
            {interactions.map((interaction) => (
              <li key={interaction.medicine_id} className={"rounded-md border border-border p-3"}>
                <div className={"flex items-center justify-between gap-3"}>
                  <span className={"min-w-0 truncate text-sm font-medium text-foreground"}>
                    {interaction.medicine_name}
                  </span>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium",
                      severityPillClasses[interaction.severity],
                    )}
                  >
                    {di.severity[interaction.severity]}
                  </span>
                </div>
                {interaction.description ? (
                  <p className={"mt-1 text-sm text-muted-foreground"}>{interaction.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={"space-y-1 border-t border-border pt-3"}>
        <p className={"text-xs text-muted-foreground"}>
          {sourceLabel}
          {info.source_name ? " · " + info.source_name : ""}
          {updatedText ? " · " + updatedText : ""}
        </p>
        <p className={"text-xs text-muted-foreground"}>{di.disclaimer}</p>
      </div>
    </div>
  );
}
