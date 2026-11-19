"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Boxes, Clock, Pill, Search, Store, TrendingUp } from "lucide-react";
import { useSession } from "@/lib/auth-context";
import { useLanguage, interpolate } from "@/lib/i18n";
import { AppHeader } from "@/components/layout/app-header";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { MedicineSearch } from "@/components/dashboard/medicine-search";
import { NotificationsCard } from "@/components/dashboard/notifications-card";
import { cn } from "@/lib/cn";

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
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <AppHeader />

      {/* Ambient Hero Banner: echoes the landing & auth surfaces with cached tablets imagery and soft mint glows */}
      <section className="relative isolate overflow-hidden border-b border-border bg-card/30">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <Image
            src="/img/hero-tablets.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[64%_25%] opacity-20 saturate-[0.85] dark:brightness-105 dark:grayscale dark:opacity-10"
          />
          {/* Subtle gradient veil for effortless text contrast across both themes */}
          <div className="absolute inset-0 bg-linear-to-b from-background/40 via-background/70 to-background dark:from-background/60 dark:via-background/85 dark:to-background" />
          {/* Soft ambient mint glow */}
          <div className="absolute -left-16 -top-20 size-[360px] rounded-full bg-primary/10 blur-[110px] dark:bg-primary/5" />
          <div className="absolute -bottom-16 right-0 size-[280px] rounded-full bg-primary/8 blur-[100px] dark:bg-primary/5" />
        </div>

        <div
          className={cn(
            "mx-auto w-full px-4 py-8 sm:px-6 sm:py-12",
            isPatient ? "max-w-4xl" : "max-w-6xl",
          )}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-subtle px-2.5 py-0.5 text-xs font-medium text-primary-strong">
                {isPharmacist ? (
                  <>
                    <Store className="size-3" aria-hidden />
                    {t.nav.roles.pharmacist}
                  </>
                ) : (
                  <>
                    <Pill className="size-3" aria-hidden />
                    {t.nav.roles.user}
                  </>
                )}
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {interpolate(t.dashboard.welcome, { name: displayName })}
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              {isPharmacist ? t.dashboard.pharmacistSubtitle : t.dashboard.userSubtitle}
            </p>
          </div>

          {/* Pending pharmacist application banner (from /auth/me). */}
          {user?.pendingPharmacistApplication && (
            <div className="mt-6">
              <Alert variant="info">{t.dashboard.pendingApplication}</Alert>
            </div>
          )}

          {isPatient && (
            <div className="mt-8">
              <MedicineSearch />
            </div>
          )}
        </div>
      </section>

      {/* Main Workspace Body */}
      <main
        className={cn(
          "mx-auto w-full flex-1 px-4 py-8 sm:px-6 sm:py-10",
          isPatient ? "max-w-4xl" : "max-w-6xl",
        )}
      >
        {isPatient ? (
          /* Patient dashboard secondary surface */
          <div className="max-w-3xl">
            <NotificationsCard />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {!isPharmacist && (
              <Card className="p-6 transition-colors">
                <span className="flex size-10 items-center justify-center rounded-full bg-primary-subtle text-primary-strong">
                  <Search className="size-5" aria-hidden />
                </span>
                <h2 className="mt-4 text-base font-semibold">{t.dashboard.findMedicine}</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {t.dashboard.searchComingSoon}
                </p>
              </Card>
            )}
            {isPharmacist && (
              <>
                {/* Pharmacy first: stock can't reach patients until it's registered
                    and verified. */}
                <Link
                  href="/dashboard/pharmacy"
                  className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xs transition-all hover:border-primary/40 hover:bg-card/80 hover:shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex size-10 items-center justify-center rounded-full bg-primary-subtle text-primary-strong">
                        <Store className="size-5" aria-hidden />
                      </span>
                      <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary-strong" aria-hidden />
                    </div>
                    <h2 className="mt-4 text-base font-semibold">{t.dashboard.pharmacy.title}</h2>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {t.dashboard.pharmacy.subtitle}
                    </p>
                  </div>
                </Link>
                <Link
                  href="/dashboard/inventory"
                  className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xs transition-all hover:border-primary/40 hover:bg-card/80 hover:shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex size-10 items-center justify-center rounded-full bg-primary-subtle text-primary-strong">
                        <Boxes className="size-5" aria-hidden />
                      </span>
                      <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary-strong" aria-hidden />
                    </div>
                    <h2 className="mt-4 text-base font-semibold">{t.dashboard.inventory.title}</h2>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {t.dashboard.inventory.manageHint}
                    </p>
                  </div>
                </Link>
                <Link
                  href="/dashboard/medicines"
                  className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xs transition-all hover:border-primary/40 hover:bg-card/80 hover:shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex size-10 items-center justify-center rounded-full bg-primary-subtle text-primary-strong">
                        <Pill className="size-5" aria-hidden />
                      </span>
                      <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary-strong" aria-hidden />
                    </div>
                    <h2 className="mt-4 text-base font-semibold">{t.dashboard.medicines.title}</h2>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {t.dashboard.medicines.manageHint}
                    </p>
                  </div>
                </Link>
                <Link
                  href="/dashboard/analytics"
                  className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xs transition-all hover:border-primary/40 hover:bg-card/80 hover:shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex size-10 items-center justify-center rounded-full bg-primary-subtle text-primary-strong">
                        <TrendingUp className="size-5" aria-hidden />
                      </span>
                      <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary-strong" aria-hidden />
                    </div>
                    <h2 className="mt-4 text-base font-semibold">{t.dashboard.analytics.title}</h2>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {t.dashboard.analytics.manageHint}
                    </p>
                  </div>
                </Link>
              </>
            )}
            <Card className="p-6">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary-subtle text-primary-strong">
                <Clock className="size-5" aria-hidden />
              </span>
              <h2 className="mt-4 text-base font-semibold">{t.dashboard.recentActivity}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {t.dashboard.activitySoon}
              </p>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
