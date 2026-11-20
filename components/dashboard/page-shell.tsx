"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { AppHeader } from "@/components/layout/app-header";
import { cn } from "@/lib/cn";

/**
 * Shared shell for dashboard sub-pages. Renders:
 *  - the fixed app header
 *  - an ambient hero banner (cached tablets photo, soft mint glows) with the page title
 *  - a body area for page-specific content
 *  - a clean, touch-friendly "Back to Dashboard" button at the bottom of the page
 *
 * This keeps every dashboard route visually consistent with the main dashboard
 * and the landing/auth surfaces without duplicating overlay markup.
 */
export function DashboardPageShell({
  title,
  subtitle,
  /** Action placed alongside the heading (e.g. "New Reminder" button). */
  headerAction,
  /** Extra content rendered inside the banner, below the subtitle (e.g. alerts, controls). */
  bannerExtra,
  /** Max-width class for the content area. Defaults to max-w-3xl. */
  maxWidth = "max-w-3xl",
  /** Whether to show a "Back to Dashboard" navigation link at the bottom of the page. Defaults to true. */
  showBackToDashboard = true,
  children,
}: {
  title: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  bannerExtra?: React.ReactNode;
  maxWidth?: string;
  showBackToDashboard?: boolean;
  children: React.ReactNode;
}) {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <AppHeader />

      {/* Ambient hero banner — calibrated exactly like hero.tsx */}
      <section className="relative isolate overflow-hidden border-b border-border">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <Image
            src="/img/hero-tablets.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-[64%_45%] saturate-[0.94] dark:opacity-[0.65] dark:grayscale dark:brightness-105"
          />
          <div className="absolute inset-0 bg-background/30 dark:bg-background/40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_46%_34%_at_50%_36%,var(--background)_0%,color-mix(in_oklab,var(--background)_68%,transparent)_55%,transparent_80%)] dark:hidden" />
          <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(ellipse_72%_52%_at_50%_38%,color-mix(in_oklab,var(--background)_55%,transparent)_0%,color-mix(in_oklab,var(--background)_20%,transparent)_50%,transparent_75%)]" />
          <div className="absolute left-1/4 top-0 size-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/12 blur-[120px] dark:bg-primary/8" />
          <div className="absolute -right-20 top-1/2 size-[360px] rounded-full bg-primary/10 blur-[100px] dark:bg-primary/5" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>

        <div className={cn("relative z-20 mx-auto w-full px-4 pt-24 pb-8 sm:px-6 sm:pt-28 sm:pb-10", maxWidth)}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground sm:text-base">
                  {subtitle}
                </p>
              )}
            </div>
            {headerAction}
          </div>
          {bannerExtra}
        </div>
      </section>

      {/* Page body */}
      <main className={cn("mx-auto w-full flex-1 px-4 py-8 sm:px-6", maxWidth)}>
        {children}

        {showBackToDashboard && (
          <div className="mt-12 border-t border-border/60 pt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-md border border-border/70 bg-card/60 px-3.5 py-2 text-sm font-medium text-muted-foreground backdrop-blur-xs transition-colors hover:border-border hover:bg-muted hover:text-foreground active:scale-[0.98]"
            >
              <ArrowLeft className="size-4 shrink-0" aria-hidden />
              <span>{t.nav.dashboard}</span>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
