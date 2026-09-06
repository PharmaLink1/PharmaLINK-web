"use client";

import * as React from "react";
import { MapPin, Phone, User } from "lucide-react";
import { pharmacyAdminApi } from "@/lib/pharmacy-api";
import type { AdminPharmacy, VerifiedStatus } from "@/lib/pharmacy-types";
import { getErrorMessage } from "@/lib/i18n/errors";
import { useLanguage, interpolate } from "@/lib/i18n";
import { AppHeader } from "@/components/layout/app-header";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Spinner } from "@/components/ui/spinner";
import { PharmacyActions } from "@/components/admin/pharmacy-actions";

/** Admin pharmacy review queue: filter by verification status and verify/reject
 * pending pharmacies. Mirrors the pharmacist-applications review screen. */
export function PharmacyReview() {
  const { t } = useLanguage();
  const p = t.admin.pharmacies;

  const [status, setStatus] = React.useState<VerifiedStatus>("pending");
  const [pharmacies, setPharmacies] = React.useState<AdminPharmacy[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const statusOptions: { value: VerifiedStatus; label: string }[] = [
    { value: "pending", label: p.status.pending },
    { value: "verified", label: p.status.verified },
    { value: "rejected", label: p.status.rejected },
  ];

  const load = React.useCallback(
    async (next: VerifiedStatus) => {
      setLoading(true);
      setError(null);
      try {
        setPharmacies(await pharmacyAdminApi.list(next));
      } catch (err) {
        setError(getErrorMessage(err, t));
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(status);
  }, [status, load]);

  // A decided pharmacy leaves the pending queue.
  const handleResolved = React.useCallback((id: string) => {
    setPharmacies((prev) => prev.filter((ph) => ph.pharmacy_id !== id));
  }, []);

  return (
    <div className={"flex min-h-dvh flex-col"}>
      <AppHeader />

      <main className={"mx-auto w-full max-w-3xl flex-1 px-6 py-10"}>
        <h1 className={"text-2xl font-semibold tracking-tight"}>{p.title}</h1>
        <p className={"mt-1 text-muted-foreground"}>{p.subtitle}</p>

        <div className={"mt-6"}>
          <SegmentedControl
            options={statusOptions}
            value={status}
            onChange={setStatus}
            ariaLabel={p.filterAria}
            disabled={loading}
          />
        </div>

        <div className={"mt-6"}>
          {loading ? (
            <div className={"flex justify-center py-16"}>
              <Spinner label={p.loading} />
            </div>
          ) : error ? (
            <Alert variant={"danger"}>{error}</Alert>
          ) : pharmacies.length === 0 ? (
            <p className={"py-16 text-center text-muted-foreground"}>
              {interpolate(p.empty, { status: p.status[status].toLowerCase() })}
            </p>
          ) : (
            <div className={"flex flex-col gap-4"}>
              {pharmacies.map((pharmacy) => (
                <Card key={pharmacy.pharmacy_id} className={"p-5"}>
                  <h2 className={"font-semibold"}>{pharmacy.name}</h2>
                  <dl className={"mt-3 space-y-1.5 text-sm text-muted-foreground"}>
                    <div className={"flex items-center gap-2"}>
                      <MapPin className={"size-4 shrink-0"} aria-hidden />
                      <span>{pharmacy.address}</span>
                    </div>
                    <div className={"flex items-center gap-2"}>
                      <Phone className={"size-4 shrink-0"} aria-hidden />
                      <span>{pharmacy.phone}</span>
                    </div>
                    <div className={"flex items-center gap-2"}>
                      <User className={"size-4 shrink-0"} aria-hidden />
                      <span>{p.owner}: {pharmacy.owner_id}</span>
                    </div>
                  </dl>
                  <div className={"mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground"}>
                    <a
                      href={pharmacy.business_license_url}
                      target={"_blank"}
                      rel={"noreferrer"}
                      className={"font-medium text-primary-strong hover:underline"}
                    >
                      {p.viewLicense}
                    </a>
                    <span>{interpolate(p.registeredOn, { date: pharmacy.created_at.slice(0, 10) })}</span>
                  </div>

                  {pharmacy.rejection_reason && (
                    <p className={"mt-2 text-sm text-danger"}>
                      {t.admin.reason} {pharmacy.rejection_reason}
                    </p>
                  )}

                  {pharmacy.verified_status === "pending" && (
                    <div className={"mt-4 border-t border-border pt-4"}>
                      <PharmacyActions pharmacyID={pharmacy.pharmacy_id} onResolved={handleResolved} />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
