"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { adminApi } from "@/lib/api-client";
import { ApiError, type PharmacistApplication } from "@/lib/auth-types";
import { useLanguage } from "@/lib/i18n";
import { getErrorMessage } from "@/lib/i18n/errors";
import { AppHeader } from "@/components/layout/app-header";
import { Alert } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ApplicationActions } from "@/components/admin/application-actions";
import { ApplicationCard } from "@/components/admin/application-card";
import { cn } from "@/lib/cn";

type Phase = "loading" | "ready" | "notFound" | "error";

/** A decision timestamp is a moment, not just a day, so the review line carries the
 * time as well - unlike the applied-on line on the card. */
function formatReviewedAt(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * One pharmacist application in full, opened from the review queue. Approve/reject
 * stay available while it is pending; once decided the page shows who decided it and
 * when. A missing application gets its own state rather than the error path, since a
 * stale or hand-edited link is the usual reason.
 */
export function ApplicationDetail({ id }: { id: string }) {
  const { locale, t } = useLanguage();
  const d = t.admin.detail;

  const [application, setApplication] = React.useState<PharmacistApplication | null>(null);
  const [phase, setPhase] = React.useState<Phase>("loading");
  const [error, setError] = React.useState("");
  const [notice, setNotice] = React.useState("");
  const [attempt, setAttempt] = React.useState(0);
  // Only set when this page recorded a decision, so the confirmation shows after the
  // refresh instead of every time an already-decided application is opened.
  const decided = React.useRef(false);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await adminApi.getApplication(id);
        if (!active) return;
        setApplication(data);
        setError("");
        setNotice(decided.current ? (data.status === "approved" ? d.approved : d.rejected) : "");
        setPhase("ready");
      } catch (err) {
        if (!active) return;
        if (err instanceof ApiError && err.code === "APPLICATION_NOT_FOUND") {
          setPhase("notFound");
          return;
        }
        setError(getErrorMessage(err, t));
        setPhase("error");
      }
    })();
    return () => {
      active = false;
    };
  }, [id, attempt, d, t]);

  function retry() {
    setError("");
    setNotice("");
    setPhase("loading");
    setAttempt((n) => n + 1);
  }

  // ApplicationActions calls the API itself; re-reading from the server keeps this
  // page in step with the decision instead of assuming the new status.
  function handleResolved() {
    decided.current = true;
    setAttempt((n) => n + 1);
  }

  return (
    <div className={"flex min-h-dvh flex-col"}>
      <AppHeader />

      <main className={"mx-auto w-full max-w-3xl flex-1 px-6 py-10"}>
        <Link
          href={"/admin/pharmacist-applications"}
          className={"inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"}
        >
          <ArrowLeft className={"size-4"} aria-hidden />
          {d.back}
        </Link>

        <h1 className={"mt-4 text-2xl font-semibold tracking-tight"}>{t.meta.applicationDetail}</h1>

        {phase === "loading" && (
          <div className={"mt-8 flex justify-center py-10"}>
            <Spinner label={d.loading} />
          </div>
        )}

        {phase === "notFound" && (
          <Card className={"mt-6 p-8 text-center"}>
            <h2 className={"font-semibold"}>{d.notFound.title}</h2>
            <p className={"mx-auto mt-1 max-w-sm text-sm text-muted-foreground"}>
              {d.notFound.body}
            </p>
            <div className={"mt-5 flex justify-center"}>
              <Link
                href={"/admin/pharmacist-applications"}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                {d.back}
              </Link>
            </div>
          </Card>
        )}

        {phase === "error" && (
          <div className={"mt-6"}>
            <Alert variant={"danger"}>
              <div className={"flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"}>
                <span>{error || d.error}</span>
                <Button type={"button"} variant={"outline"} size={"sm"} onClick={retry}>
                  {d.retry}
                </Button>
              </div>
            </Alert>
          </div>
        )}

        {phase === "ready" && application && (
          <div className={"mt-6 space-y-4"}>
            {notice && <Alert variant={"success"}>{notice}</Alert>}

            <ApplicationCard
              application={application}
              actions={
                application.status === "pending" ? (
                  <ApplicationActions id={application.id} onResolved={handleResolved} />
                ) : undefined
              }
            />

            <Card className={"p-5"}>
              <dl className={"grid gap-3 text-sm sm:grid-cols-2"}>
                <div>
                  <dt className={"text-muted-foreground"}>{d.applicationId}</dt>
                  <dd className={"mt-0.5 break-all font-medium"}>{application.id}</dd>
                </div>
                {application.reviewedBy && (
                  <div>
                    <dt className={"text-muted-foreground"}>{d.reviewedBy}</dt>
                    <dd className={"mt-0.5 break-all font-medium"}>{application.reviewedBy}</dd>
                  </div>
                )}
                {application.reviewedAt && (
                  <div>
                    <dt className={"text-muted-foreground"}>{d.reviewedAt}</dt>
                    <dd className={"mt-0.5 font-medium"}>
                      {formatReviewedAt(application.reviewedAt, locale)}
                    </dd>
                  </div>
                )}
              </dl>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
