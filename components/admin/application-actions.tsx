"use client";

import * as React from "react";
import { adminApi } from "@/lib/api-client";
import { ApiError } from "@/lib/auth-types";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

// Backend errors that mean this card is stale (already decided or gone), so we
// drop it from the list rather than letting the admin retry.
const STALE_CODES = ["APPLICATION_NOT_PENDING", "APPLICATION_NOT_FOUND"];

/**
 * Approve / reject controls for a pending application. Rejecting reveals an
 * inline reason box (the backend requires a reason). On success — or on a stale
 * item — it calls onResolved so the parent removes the card from the queue.
 */
export function ApplicationActions({
  id,
  onResolved,
}: {
  id: string;
  onResolved: (id: string) => void;
}) {
  const [rejecting, setRejecting] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [reasonError, setReasonError] = React.useState<string | undefined>();
  const [submitting, setSubmitting] = React.useState<"approve" | "reject" | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  function handleError(err: unknown) {
    if (err instanceof ApiError && STALE_CODES.includes(err.code)) {
      onResolved(id); // someone already decided this one, or it's gone
      return;
    }
    setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    setSubmitting(null);
  }

  async function handleApprove() {
    setError(null);
    setSubmitting("approve");
    try {
      await adminApi.approveApplication(id);
      onResolved(id);
    } catch (err) {
      handleError(err);
    }
  }

  async function handleReject(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!reason.trim()) {
      setReasonError("Please give a reason for rejecting.");
      return;
    }
    setReasonError(undefined);
    setSubmitting("reject");
    try {
      await adminApi.rejectApplication(id, reason.trim());
      onResolved(id);
    } catch (err) {
      handleError(err);
    }
  }

  if (rejecting) {
    return (
      <form onSubmit={handleReject} noValidate className="w-full flex flex-col gap-3">
        {error && <Alert variant="danger">{error}</Alert>}
        <Field label="Reason for rejection" htmlFor={`reject-reason-${id}`} error={reasonError}>
          <textarea
            id={`reject-reason-${id}`}
            rows={3}
            placeholder="Explain why this application is being rejected."
            className="w-full rounded-md border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/30"
            value={reason}
            aria-invalid={reasonError ? true : undefined}
            disabled={submitting !== null}
            onChange={(e) => setReason(e.target.value)}
          />
        </Field>
        <div className="flex items-center gap-3">
          <Button type="submit" variant="destructive" size="sm" loading={submitting === "reject"}>
            {submitting === "reject" ? "Rejecting" : "Confirm rejection"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={submitting !== null}
            onClick={() => {
              setRejecting(false);
              setReason("");
              setReasonError(undefined);
              setError(null);
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="w-full flex flex-col gap-3">
      {error && <Alert variant="danger">{error}</Alert>}
      <div className="flex items-center gap-3">
        <Button size="sm" loading={submitting === "approve"} onClick={handleApprove}>
          {submitting === "approve" ? "Approving" : "Approve"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={submitting !== null}
          onClick={() => setRejecting(true)}
        >
          Reject
        </Button>
      </div>
    </div>
  );
}
