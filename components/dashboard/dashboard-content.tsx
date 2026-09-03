"use client";

import { Clock, Search, Store } from "lucide-react";
import { useSession } from "@/lib/auth-context";
import { useLanguage, interpolate } from "@/lib/i18n";
import { AppHeader } from "@/components/layout/app-header";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";

export function DashboardContent() {
  const { user } = useSession();
  const { t } = useLanguage();
  const displayName = user ? [user.firstName, user.lastName].filter(Boolean).join(" ") : t.dashboard.guest;
  const isPharmacist = user?.role === "pharmacist";

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">
          {interpolate(t.dashboard.welcome, { name: displayName })}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {isPharmacist ? t.dashboard.pharmacistSubtitle : t.dashboard.userSubtitle}
        </p>

        {/* Pending pharmacist application banner (from /auth/me). */}
        {user?.pendingPharmacistApplication && (
          <div className="mt-6">
            <Alert variant="info">{t.dashboard.pendingApplication}</Alert>
          </div>
        )}

        {/* Placeholder shell for features built later. */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="p-5">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary-subtle text-primary-strong">
              <Search className="size-5" aria-hidden />
            </span>
            <h2 className="mt-4 font-semibold">{t.dashboard.findMedicine}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t.dashboard.searchComingSoon}</p>
          </Card>
          <Card className="p-5">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary-subtle text-primary-strong">
              <Clock className="size-5" aria-hidden />
            </span>
            <h2 className="mt-4 font-semibold">{t.dashboard.recentActivity}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t.dashboard.activitySoon}</p>
          </Card>
          {isPharmacist && (
            <Card className="p-5">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary-subtle text-primary-strong">
                <Store className="size-5" aria-hidden />
              </span>
              <h2 className="mt-4 font-semibold">{t.dashboard.yourPharmacy}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t.dashboard.pharmacySoon}</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
