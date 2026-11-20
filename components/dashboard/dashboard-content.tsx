"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AlarmClock,
  ArrowRight,
  Boxes,
  Clock,
  MapPin,
  Pill,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
} from "lucide-react";
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

      {/* ─── Hero Command Section: Starts at top-0 behind the fixed floating header ─── */}
      <section className="relative isolate overflow-hidden border-b border-border pt-24 pb-14 sm:pt-28 sm:pb-20 lg:pt-32">
        {/* Ambient background photo & overlays — calibrated exactly like hero.tsx */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <Image
            src="/img/hero-tablets.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[64%_45%] saturate-[0.94] dark:opacity-[0.65] dark:grayscale dark:brightness-105"
          />
          {/* Light: luminous pool under copy; Dark: cinematic diffused veil (identical to hero page) */}
          <div className="absolute inset-0 bg-background/30 dark:bg-background/40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_46%_34%_at_50%_36%,var(--background)_0%,color-mix(in_oklab,var(--background)_68%,transparent)_55%,transparent_80%)] dark:hidden" />
          <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(ellipse_72%_52%_at_50%_38%,color-mix(in_oklab,var(--background)_55%,transparent)_0%,color-mix(in_oklab,var(--background)_20%,transparent)_50%,transparent_75%)]" />
          {/* Ambient mint brand glows */}
          <div className="absolute left-1/4 top-0 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/12 blur-[120px] dark:bg-primary/8" />
          <div className="absolute -right-20 top-1/2 size-[360px] rounded-full bg-primary/10 blur-[100px] dark:bg-primary/5" />
          {/* Smooth bottom linear fade into main content */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>

        <div
          className={cn(
            "mx-auto w-full px-4 sm:px-6",
            isPatient ? "max-w-4xl" : "max-w-6xl",
          )}
        >
          {/* Header intro */}
          <div className="flex flex-col items-start gap-3">
            {/* Live Status Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/85 px-3 py-1 text-xs font-medium shadow-xs backdrop-blur-md">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              {isPharmacist ? (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Store className="size-3 text-primary-strong" aria-hidden />
                  <span className="font-semibold text-foreground">{t.nav.roles.pharmacist}</span> · Operations Hub
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Pill className="size-3 text-primary-strong" aria-hidden />
                  <span className="font-semibold text-foreground">{t.nav.roles.user}</span> · Addis Ababa Network
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                {interpolate(t.dashboard.welcome, { name: displayName })}
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {isPharmacist ? t.dashboard.pharmacistSubtitle : t.dashboard.userSubtitle}
              </p>
            </div>
          </div>

          {/* Pending pharmacist application banner */}
          {user?.pendingPharmacistApplication && (
            <div className="mt-6">
              <Alert variant="info">{t.dashboard.pendingApplication}</Alert>
            </div>
          )}

          {/* Patient Search Section */}
          {isPatient && (
            <div className="relative mt-8 overflow-hidden rounded-2xl border border-border/80 bg-card/90 p-2 shadow-2xl shadow-primary/10 backdrop-blur-2xl dark:border-white/10 dark:bg-card/85 sm:p-3">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent"
              />
              <MedicineSearch />
            </div>
          )}
        </div>
      </section>

      {/* ─── Main Content Workspace ─── */}
      <main
        className={cn(
          "mx-auto w-full flex-1 px-4 py-8 sm:px-6 sm:py-12",
          isPatient ? "max-w-4xl" : "max-w-6xl",
        )}
      >
        {isPatient ? (
          /* ─── Patient Quick Access & Services ─── */
          <div className="space-y-10">
            {/* Quick Access Cards */}
            <div>
              <div className="flex items-center justify-between pb-4">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">
                    Quick Services
                  </h2>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    Essential companion tools for your healthcare needs
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* 1. Pharmacy Locator */}
                <Link
                  href="/dashboard/pharmacies"
                  className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/80 bg-card p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex size-11 items-center justify-center rounded-xl bg-primary-subtle text-primary-strong transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <MapPin className="size-5" aria-hidden />
                      </span>
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                        Live Map
                      </span>
                    </div>
                    <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">
                      {t.nav.pharmacies}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      Find open pharmacies sorted by real distance, opening hours, and contact numbers.
                    </p>
                  </div>
                  <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-primary-strong group-hover:underline">
                    <span>Explore locator</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
                  </div>
                </Link>

                {/* 2. Refill Reminders */}
                <Link
                  href="/dashboard/reminders"
                  className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/80 bg-card p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex size-11 items-center justify-center rounded-xl bg-primary-subtle text-primary-strong transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <AlarmClock className="size-5" aria-hidden />
                      </span>
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                        Scheduled
                      </span>
                    </div>
                    <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">
                      {t.nav.reminders}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      Set automated prescription alerts so you and your family never miss a scheduled dose.
                    </p>
                  </div>
                  <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-primary-strong group-hover:underline">
                    <span>Manage alerts</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
                  </div>
                </Link>

                {/* 3. Safety & Pricing Transparency */}
                <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/80 bg-card p-6 shadow-xs transition-all duration-200 hover:border-border sm:col-span-2 lg:col-span-1">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex size-11 items-center justify-center rounded-xl bg-primary-subtle text-primary-strong">
                        <ShieldCheck className="size-5" aria-hidden />
                      </span>
                      <span className="rounded-full bg-success-subtle px-2.5 py-0.5 text-[11px] font-medium text-success">
                        Verified ETB
                      </span>
                    </div>
                    <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">
                      Pricing & Safety
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      Transparent prices updated directly by licensed pharmacists. Plain-language safety guidelines in Amharic & English.
                    </p>
                  </div>
                  <div className="mt-5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Sparkles className="size-3.5 text-primary-strong" aria-hidden />
                    <span>Free for all patients</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Subscription Center */}
            <div className="rounded-xl border border-border/80 bg-card/50 p-1">
              <NotificationsCard />
            </div>
          </div>
        ) : (
          /* ─── Pharmacist Operations Command Grid ─── */
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Operations & Management
              </h2>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Control your pharmacy presence, stock availability, and market analytics
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
              {/* 1. Your Pharmacy */}
              <Link
                href="/dashboard/pharmacy"
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/80 bg-card p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-primary-subtle text-primary-strong transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Store className="size-6" aria-hidden />
                    </span>
                    <span className="rounded-full bg-primary-subtle px-2.5 py-0.5 text-xs font-medium text-primary-strong">
                      Storefront
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                    {t.dashboard.pharmacy.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t.dashboard.pharmacy.subtitle} Manage location coordinates, phone numbers, opening hours, and verification status.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-primary-strong group-hover:underline">
                  <span>Manage pharmacy details</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </div>
              </Link>

              {/* 2. Inventory Management */}
              <Link
                href="/dashboard/inventory"
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/80 bg-card p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-primary-subtle text-primary-strong transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Boxes className="size-6" aria-hidden />
                    </span>
                    <span className="rounded-full bg-primary-subtle px-2.5 py-0.5 text-xs font-medium text-primary-strong">
                      Live Stock
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                    {t.dashboard.inventory.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t.dashboard.inventory.manageHint} Quick 2-tap stock toggles (In / Low / Out), live ETB price edits, and CSV bulk upload.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-primary-strong group-hover:underline">
                  <span>Update stock & prices</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </div>
              </Link>

              {/* 3. Medicines Catalogue */}
              <Link
                href="/dashboard/medicines"
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/80 bg-card p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-primary-subtle text-primary-strong transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Pill className="size-6" aria-hidden />
                    </span>
                    <span className="rounded-full bg-primary-subtle px-2.5 py-0.5 text-xs font-medium text-primary-strong">
                      Clinical DB
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                    {t.dashboard.medicines.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t.dashboard.medicines.manageHint} Explore standardized generic names, dosage forms, strength metrics, and Amharic titles.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-primary-strong group-hover:underline">
                  <span>Browse catalogue</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </div>
              </Link>

              {/* 4. Demand Analytics */}
              <Link
                href="/dashboard/analytics"
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/80 bg-card p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-primary-subtle text-primary-strong transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <TrendingUp className="size-6" aria-hidden />
                    </span>
                    <span className="rounded-full bg-primary-subtle px-2.5 py-0.5 text-xs font-medium text-primary-strong">
                      Market Signals
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                    {t.dashboard.analytics.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t.dashboard.analytics.manageHint} View what medicines patients nearby searched for that your pharmacy doesn't carry yet.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-primary-strong group-hover:underline">
                  <span>Inspect demand trends</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </div>
              </Link>
            </div>

            {/* Operations Summary Card */}
            <Card className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary-strong">
                  <Clock className="size-5" aria-hidden />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{t.dashboard.recentActivity}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                    {t.dashboard.activitySoon}
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard/inventory"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Boxes className="size-3.5" aria-hidden />
                Quick Stock Update
              </Link>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

