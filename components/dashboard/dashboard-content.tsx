"use client";

import { Boxes, Clock, Pill, Search, Store } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth-context";
import { useLanguage, interpolate } from "@/lib/i18n";
import { AppHeader } from "@/components/layout/app-header";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { MedicineSearch } from "@/components/dashboard/medicine-search";

export function DashboardContent() {
  const { user } = useSession();
  const { t } = useLanguage();
  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ")
    : t.dashboard.guest;
  const role = user?.role;
  const isPharmacist = role === "pharmacist";
  const isPatient = role === "user";

  return (
    <div className={"flex min-h-dvh flex-col"}>
      <AppHeader />

      <main className={"mx-auto w-full max-w-6xl flex-1 px-6 py-10"}>
        <h1 className={"text-2xl font-semibold tracking-tight"}>
          {interpolate(t.dashboard.welcome, { name: displayName })}
        </h1>
        <p className={"mt-1 text-muted-foreground"}>
          {isPharmacist ? t.dashboard.pharmacistSubtitle : t.dashboard.userSubtitle}
        </p>

        {/* Pending pharmacist application banner (from /auth/me). */}
        {user?.pendingPharmacistApplication && (
          <div className={"mt-6"}>
            <Alert variant={"info"}>{t.dashboard.pendingApplication}</Alert>
          </div>
        )}

        {isPatient ? (
          /* Patient dashboard: search-first workspace. */
          <div className={"mt-8 max-w-3xl"}>
            <MedicineSearch />
          </div>
        ) : (
          <div className={"mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"}>
            {!isPharmacist && (
              <Card className={"p-5"}>
                <span className={"flex size-10 items-center justify-center rounded-full bg-primary-subtle text-primary-strong"}>
                  <Search className={"size-5"} aria-hidden />
                </span>
                <h2 className={"mt-4 font-semibold"}>{t.dashboard.findMedicine}</h2>
                <p className={"mt-1 text-sm text-muted-foreground"}>
                  {t.dashboard.searchComingSoon}
                </p>
              </Card>
            )}
            {isPharmacist && (
              <>
                {/* Pharmacy first: stock can't reach patients until it's registered
                    and verified. */}
                <Link
                  href={"/dashboard/pharmacy"}
                  className={"rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm transition-colors hover:bg-muted"}
                >
                  <span className={"flex size-10 items-center justify-center rounded-full bg-primary-subtle text-primary-strong"}>
                    <Store className={"size-5"} aria-hidden />
                  </span>
                  <h2 className={"mt-4 font-semibold"}>{t.dashboard.pharmacy.title}</h2>
                  <p className={"mt-1 text-sm text-muted-foreground"}>
                    {t.dashboard.pharmacy.subtitle}
                  </p>
                </Link>
                <Link
                  href={"/dashboard/inventory"}
                  className={"rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm transition-colors hover:bg-muted"}
                >
                  <span className={"flex size-10 items-center justify-center rounded-full bg-primary-subtle text-primary-strong"}>
                    <Boxes className={"size-5"} aria-hidden />
                  </span>
                  <h2 className={"mt-4 font-semibold"}>{t.dashboard.inventory.title}</h2>
                  <p className={"mt-1 text-sm text-muted-foreground"}>
                    {t.dashboard.inventory.manageHint}
                  </p>
                </Link>
                <Link
                  href={"/dashboard/medicines"}
                  className={"rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm transition-colors hover:bg-muted"}
                >
                  <span className={"flex size-10 items-center justify-center rounded-full bg-primary-subtle text-primary-strong"}>
                    <Pill className={"size-5"} aria-hidden />
                  </span>
                  <h2 className={"mt-4 font-semibold"}>{t.dashboard.medicines.title}</h2>
                  <p className={"mt-1 text-sm text-muted-foreground"}>
                    {t.dashboard.medicines.manageHint}
                  </p>
                </Link>
              </>
            )}
            <Card className={"p-5"}>
              <span className={"flex size-10 items-center justify-center rounded-full bg-primary-subtle text-primary-strong"}>
                <Clock className={"size-5"} aria-hidden />
              </span>
              <h2 className={"mt-4 font-semibold"}>{t.dashboard.recentActivity}</h2>
              <p className={"mt-1 text-sm text-muted-foreground"}>
                {t.dashboard.activitySoon}
              </p>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
