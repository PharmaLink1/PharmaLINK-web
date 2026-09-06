"use client";

import * as React from "react";
import { pharmacyAdminApi } from "@/lib/pharmacy-api";
import { getErrorMessage } from "@/lib/i18n/errors";
import { useLanguage } from "@/lib/i18n";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

/** Verify / reject controls for one pending pharmacy. Reject expands into an inline
 * reason form, mirroring the pharmacist-application actions. On success the parent
 * drops the row from the pending queue. */
export function PharmacyActions({
  pharmacyID,
  onResolved,
}: {
  pharmacyID: string;
  onResolved: (id: string) => void;
}) {
  const { t } = useLanguage();
  const p = t.admin.pharmacies;

  const [rejecting, setRejecting] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [reasonError, setReasonError] = React.useState<string | undefined>();
  const [submitting, setSubmitting] = React.useState<"verify" | "reject" | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleVerify() {
    setError(null);
    setSubmitting("verify");
    try {
      await pharmacyAdminApi.review(pharmacyID, "verify");
      onResolved(pharmacyID);
    } catch (err) {
      setError(getErrorMessage(err, t));
      setSubmitting(null);
    }
  }

  async function handleReject(event: React.FormEvent) {
    event.preventDefault();
    if (!reason.trim()) {
      setReasonError(p.rejectReasonRequired);
      return;
    }
    setError(null);
    setSubmitting("reject");
    try {
      await pharmacyAdminApi.review(pharmacyID, "reject", reason.trim());
      onResolved(pharmacyID);
    } catch (err) {
      setError(getErrorMessage(err, t));
      setSubmitting(null);
    }
  }

  if (rejecting) {
    return (
      <form onSubmit={handleReject} noValidate className={"flex w-full flex-col gap-3"}>
        {error && <Alert variant={"danger"}>{error}</Alert>}
        <Field label={p.rejectReasonLabel} htmlFor={`reject-${pharmacyID}`} error={reasonError}>
          <textarea
            id={`reject-${pharmacyID}`}
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={p.rejectReasonPlaceholder}
            aria-invalid={reasonError ? true : undefined}
            disabled={submitting !== null}
            className={
              "w-full rounded-md border border-input bg-card px-3.5 py-2.5 text-sm text-foreground " +
              "placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none " +
              "focus-visible:ring-2 focus-visible:ring-ring/40 aria-[invalid=true]:border-danger " +
              "disabled:cursor-not-allowed disabled:opacity-60"
            }
          />
        </Field>
        <div className={"flex items-center gap-3"}>
          <Button type={"submit"} variant={"destructive"} size={"sm"} loading={submitting === "reject"}>
            {submitting === "reject" ? p.rejecting : p.confirmRejection}
          </Button>
          <Button
            type={"button"}
            variant={"ghost"}
            size={"sm"}
            disabled={submitting !== null}
            onClick={() => {
              setRejecting(false);
              setReason("");
              setReasonError(undefined);
              setError(null);
            }}
          >
            {p.cancel}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className={"flex w-full flex-col gap-3"}>
      {error && <Alert variant={"danger"}>{error}</Alert>}
      <div className={"flex items-center gap-3"}>
        <Button type={"button"} size={"sm"} loading={submitting === "verify"} onClick={handleVerify}>
          {submitting === "verify" ? p.verifying : p.verify}
        </Button>
        <Button
          type={"button"}
          variant={"outline"}
          size={"sm"}
          disabled={submitting !== null}
          onClick={() => setRejecting(true)}
        >
          {p.reject}
        </Button>
      </div>
    </div>
  );
}
