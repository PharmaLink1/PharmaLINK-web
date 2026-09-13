"use client";

import * as React from "react";
import { adminApi } from "@/lib/api-client";
import { ApiError, type ApplicationStatus, type PharmacistApplication } from "@/lib/auth-types";
import { useLanguage, interpolate } from "@/lib/i18n";
import { getErrorMessage } from "@/lib/i18n/errors";
import { AppHeader } from "@/components/layout/app-header";
import { Alert } from "@/components/ui/alert";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Spinner } from "@/components/ui/spinner";
import { ApplicationCard } from "@/components/admin/application-card";
import { ApplicationActions } from "@/components/admin/application-actions";

export function ApplicationsReview() {
  const { t } = useLanguage();
  const [status, setStatus] = React.useState<ApplicationStatus>("pending");
  const [applications, setApplications] = React.useState<PharmacistApplication[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const statusOptions: { value: ApplicationStatus; label: string }[] = [
    { value: "pending", label: t.admin.status.pending },
    { value: "approved", label: t.admin.status.approved },
    { value: "rejected", label: t.admin.status.rejected },
  ];

  const load = React.useCallback(
    async (next: ApplicationStatus) => {
      setLoading(true);
      setError(null);
      try {
        const data = await adminApi.listApplications(next);
        setApplications(data);
      } catch (err) {
        setError(err instanceof ApiError ? getErrorMessage(err, t) : t.errors.loadApplications);
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  // Re-fetch whenever the status filter changes. `load` sets loading/error state
  // synchronously so the spinner shows immediately - a legitimate data-fetch
  // effect, hence the scoped disable.
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(status);
  }, [status, load]);

  // A decided application is no longer "pending", so drop it from the queue.
  const handleResolved = React.useCallback((id: string) => {
    setApplications((prev) => prev.filter((application) => application.id !== id));
  }, []);

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">{t.admin.title}</h1>
        <p className="mt-1 text-muted-foreground">{t.admin.subtitle}</p>

        <div className="mt-6">
          <SegmentedControl
            options={statusOptions}
            value={status}
            onChange={setStatus}
            ariaLabel={t.admin.filterAria}
            disabled={loading}
          />
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner label={t.admin.loading} />
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : applications.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground">
              {interpolate(t.admin.empty, { status: t.admin.status[status].toLowerCase() })}
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {applications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  actions={
                    application.status === "pending" ? (
                      <ApplicationActions id={application.id} onResolved={handleResolved} />
                    ) : undefined
                  }
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
