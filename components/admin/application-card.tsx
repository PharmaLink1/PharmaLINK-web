import * as React from "react";
import type { ApplicationStatus, PharmacistApplication } from "@/lib/auth-types";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";

const statusStyles: Record<ApplicationStatus, string> = {
  pending: "border-warning/30 bg-warning-subtle text-warning",
  approved: "border-success/30 bg-success-subtle text-success",
  rejected: "border-danger/30 bg-danger-subtle text-danger",
};

function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        statusStyles[status],
      )}
    >
      {status}
    </span>
  );
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

/**
 * One pharmacist application in the admin review queue. Presentational only —
 * the optional `actions` slot renders approve/reject controls for pending items.
 */
export function ApplicationCard({
  application,
  actions,
}: {
  application: PharmacistApplication;
  actions?: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate font-semibold">Pharmacist application</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Applied {formatDate(application.createdAt)}
          </p>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Degree certificate</dt>
          <dd className="mt-0.5">
            <a
              href={application.pharmacistDegreeCertificateUrl}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              View certificate
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Applicant ID</dt>
          <dd className="mt-0.5 font-medium">{application.userId}</dd>
        </div>
      </dl>

      {application.status === "rejected" && application.rejectReason && (
        <p className="mt-4 rounded-md border border-danger/30 bg-danger-subtle px-3 py-2 text-sm text-foreground/90">
          <span className="font-medium">Reason:</span> {application.rejectReason}
        </p>
      )}

      {actions && <div className="mt-5 flex items-center gap-3">{actions}</div>}
    </Card>
  );
}
