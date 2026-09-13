"use client";

import { CircleAlert, CircleCheck, Clock } from "lucide-react";
import type { VerifiedStatus } from "@/lib/pharmacy-types";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/cn";

/** Verification state of a pharmacy, as a compact pill. A pharmacy's stock only
 * reaches patient search once it is verified, so this is the pharmacist's key signal. */
export function VerifiedBadge({
  status,
  t,
  className,
}: {
  status: VerifiedStatus;
  t: Dictionary;
  className?: string;
}) {
  const labels = t.dashboard.pharmacy.status;
  const styles = {
    pending: { box: "bg-warning-subtle text-warning", Icon: Clock, label: labels.pending },
    verified: { box: "bg-success-subtle text-success", Icon: CircleCheck, label: labels.verified },
    rejected: { box: "bg-danger-subtle text-danger", Icon: CircleAlert, label: labels.rejected },
  } as const;

  const { box, Icon, label } = styles[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        box,
        className,
      )}
    >
      <Icon className={"size-3.5"} aria-hidden />
      {label}
    </span>
  );
}

/** The one-line explanation that goes with a status. */
export function verifiedHint(status: VerifiedStatus, t: Dictionary): string {
  const labels = t.dashboard.pharmacy.status;
  if (status === "verified") return labels.verifiedHint;
  if (status === "rejected") return labels.rejectedHint;
  return labels.pendingHint;
}
