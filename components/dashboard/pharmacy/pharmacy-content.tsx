"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Boxes, Plus } from "lucide-react";
import { pharmacyApi } from "@/lib/pharmacy-api";
import type { MyPharmacy } from "@/lib/pharmacy-types";
import { getErrorMessage } from "@/lib/i18n/errors";
import { useLanguage } from "@/lib/i18n";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { AppHeader } from "@/components/layout/app-header";
import { PharmacyForm } from "@/components/dashboard/pharmacy/pharmacy-form";
import { VerifiedBadge, verifiedHint } from "@/components/dashboard/pharmacy/verified-badge";
import { cn } from "@/lib/cn";

/** Pharmacist pharmacy screen: shows their pharmacy and verification state, or the
 * registration form when they don't have one yet. */
export function PharmacyContent() {
  const { t } = useLanguage();
  const p = t.dashboard.pharmacy;

  const [pharmacies, setPharmacies] = React.useState<MyPharmacy[] | null>(null);
  const [error, setError] = React.useState("");
  const [justRegistered, setJustRegistered] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);

  const load = React.useCallback(async () => {
    setError("");
    try {
      setPharmacies(await pharmacyApi.listMine());
    } catch (err) {
      setError(getErrorMessage(err, t));
      setPharmacies([]);
    }
  }, [t]);

  React.useEffect(() => {
    // load() sets loading/error state synchronously so the spinner shows immediately —
    // a legitimate data-fetch effect, hence the scoped disable (as in applications-review).
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

        <h1 className={"mt-4 text-2xl font-semibold tracking-tight"}>{p.title}</h1>
        <p className={"mt-1 text-muted-foreground"}>{p.subtitle}</p>

        {justRegistered && (
          <div className={"mt-6"}>
            <Alert variant={"success"}>{p.form.registered}</Alert>
          </div>
        )}
        {error && (
          <div className={"mt-6"}>
            <Alert variant={"danger"}>{error}</Alert>
          </div>
        )}

        <div className={"mt-6"}>
          {pharmacies === null ? (
            <div className={"flex justify-center py-10"}>
              <Spinner label={p.loading} />
            </div>
          ) : (
            <div className={"space-y-3"}>
              {pharmacies.map((pharmacy) => (
                <Card key={pharmacy.pharmacy_id} className={"p-5"}>
                  <div className={"flex flex-wrap items-start justify-between gap-3"}>
                    <div className={"min-w-0"}>
                      <h2 className={"font-semibold"}>{pharmacy.name}</h2>
                      <p className={"mt-1 text-sm text-muted-foreground"}>
                        {verifiedHint(pharmacy.verified_status, t)}
                      </p>
                      {pharmacy.rejection_reason && (
                        <p className={"mt-2 text-sm text-danger"}>
                          {t.admin.reason} {pharmacy.rejection_reason}
                        </p>
                      )}
                    </div>
                    <VerifiedBadge status={pharmacy.verified_status} t={t} />
                  </div>
                  <div className={"mt-4"}>
                    <Link
                      href={`/dashboard/inventory?pharmacy=${pharmacy.pharmacy_id}`}
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                    >
                      <Boxes className={"size-4"} aria-hidden />
                      {t.dashboard.inventory.manage}
                    </Link>
                  </div>
                </Card>
              ))}

              {showForm || pharmacies.length === 0 ? (
                <div className={"space-y-3"}>
                  {pharmacies.length > 0 && (
                    <button
                      type={"button"}
                      onClick={() => setShowForm(false)}
                      className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                    >
                      {t.common.cancel}
                    </button>
                  )}
                  <PharmacyForm
                    onRegistered={() => {
                      setJustRegistered(true);
                      setShowForm(false);
                      void load();
                    }}
                  />
                </div>
              ) : (
                <button
                  type={"button"}
                  onClick={() => {
                    setJustRegistered(false);
                    setShowForm(true);
                  }}
                  className={cn(buttonVariants({ variant: "outline" }))}
                >
                  <Plus className={"size-4"} aria-hidden />
                  {p.addAnother}
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
