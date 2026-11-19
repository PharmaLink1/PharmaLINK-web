"use client";

import Link from "next/link";
import { ArrowRight, Check, CheckCircle2, Search, Store, UserRound } from "lucide-react";
import { cn } from "@/lib/cn";
import { useLanguage, interpolate } from "@/lib/i18n";
import { SiteHeader } from "@/components/layout/site-header";
import { HeroSection } from "@/components/hero";
import { Reveal } from "@/components/motion/reveal";
import { TaglineReveal } from "@/components/motion/tagline-reveal";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

type StockLevel = "in" | "low";

const compareRows: {
  id: string;
  name: string;
  distance: string;
  stock: StockLevel;
  price: string;
  best: boolean;
}[] = [
  { id: "care", name: "Care Pharmacy", distance: "1.2 km", stock: "in", price: "ETB 85", best: true },
  { id: "zemen", name: "Zemen Drugstore", distance: "2.4 km", stock: "low", price: "ETB 92", best: false },
  { id: "stmary", name: "St. Mary Pharmacy", distance: "3.1 km", stock: "in", price: "ETB 98", best: false },
];

function SectionHeading({
  eyebrow,
  title,
  body,
  center = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="text-sm font-medium text-primary-strong">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      <p className="mt-4 max-w-xl text-pretty text-muted-foreground">{body}</p>
    </div>
  );
}

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg"
      >
        {t.nav.skipToContent}
      </a>

      <SiteHeader />

      <main id="main" className="flex-1">
        <HeroSection />

        {/* Tagline moment: the promise, in large type, lit word by word. */}
        <section className="border-y border-border bg-card">
          <div className="mx-auto max-w-6xl px-6 py-20 sm:py-32 lg:py-36">
            <TaglineReveal lines={t.home.tagline} />
          </div>
        </section>

        {/* Price comparison: heading left, the decision surface right. */}
        <section id="compare" className="mx-auto max-w-6xl px-6 py-20 sm:py-28 lg:py-32">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-start lg:gap-14">
            <Reveal>
              <SectionHeading
                eyebrow={t.home.compare.eyebrow}
                title={t.home.compare.title}
                body={t.home.compare.body}
              />
            </Reveal>

            <Reveal delay={0.08}>
              {/* Mobile: stacked rows. The calm table returns at sm+. */}
              <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card shadow-sm sm:hidden">
                {compareRows.map((row) => (
                  <li key={row.id} className={cn("px-4 py-3.5", row.best && "bg-primary-subtle/40")}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="min-w-0 truncate text-sm font-medium">{row.name}</p>
                      <p className="shrink-0 text-sm font-semibold tabular-nums">{row.price}</p>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
                      {row.best && (
                        <span className="inline-flex items-center gap-1 font-medium text-primary-strong">
                          <CheckCircle2 className="size-3.5" aria-hidden />
                          {t.home.bestPrice}
                        </span>
                      )}
                      {row.best && <span aria-hidden>·</span>}
                      <span>{row.distance}</span>
                      <span aria-hidden>·</span>
                      <span className={cn("font-medium", row.stock === "in" ? "text-success" : "text-warning")}>
                        {row.stock === "in" ? t.common.inStock : t.common.lowStock}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="hidden overflow-hidden rounded-lg border border-border bg-card shadow-sm sm:block">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">{t.home.compareCaption}</caption>
                  <thead>
                    <tr className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                      <th scope="col" className="px-5 py-3 font-medium">{t.home.columns.pharmacy}</th>
                      <th scope="col" className="hidden px-4 py-3 font-medium sm:table-cell">{t.home.columns.distance}</th>
                      <th scope="col" className="px-4 py-3 font-medium">{t.home.columns.stock}</th>
                      <th scope="col" className="px-5 py-3 text-right font-medium">{t.home.columns.price}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {compareRows.map((row) => (
                      <tr key={row.id} className={cn(row.best && "bg-primary-subtle/40")}>
                        <td className="px-5 py-4 font-medium">
                          <span className="flex flex-wrap items-center gap-2">
                            {row.name}
                            {row.best && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                                <CheckCircle2 className="size-3" aria-hidden />
                                {t.home.bestPrice}
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="hidden px-4 py-4 text-muted-foreground sm:table-cell">{row.distance}</td>
                        <td className="px-4 py-4">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                              row.stock === "in" ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning",
                            )}
                          >
                            {row.stock === "in" && <CheckCircle2 className="size-3.5" aria-hidden />}
                            {row.stock === "in" ? t.common.inStock : t.common.lowStock}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right font-semibold tabular-nums">{row.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-4 text-xs text-muted-foreground">{t.home.compareFootnote}</p>
            </Reveal>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="border-y border-border bg-card">
          <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28 lg:py-32">
            <Reveal>
              <SectionHeading eyebrow={t.home.how.eyebrow} title={t.home.how.title} body={t.home.how.body} />
            </Reveal>

            <div className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
              {t.home.steps.map((step, index) => (
                <Reveal key={step.title} delay={index * 0.08}>
                  <div className="h-full border-t border-border pt-6">
                    <span className="text-sm font-semibold tabular-nums text-primary-strong">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-3 text-xl font-semibold tracking-tight">{step.title}</h3>
                    <p className="mt-2 text-sm text-pretty text-muted-foreground">{step.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Who it's for: patients and pharmacies, as peers. */}
        <section id="audiences" className="mx-auto max-w-6xl px-6 py-20 sm:py-28 lg:py-32">
          <Reveal>
            <SectionHeading
              eyebrow={t.home.audiences.eyebrow}
              title={t.home.audiences.title}
              body={t.home.audiences.body}
            />
          </Reveal>

          <div className="mt-12 grid gap-4 lg:grid-cols-2 lg:gap-6">
            <Reveal delay={0.05}>
              <div className="flex h-full flex-col rounded-lg border border-border bg-card p-8">
                <span className="flex size-10 items-center justify-center rounded-full bg-primary-subtle text-primary-strong">
                  <UserRound className="size-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-xl font-semibold tracking-tight">{t.home.patients.title}</h3>
                <p className="mt-2 text-sm text-pretty text-muted-foreground">{t.home.patients.body}</p>
                <ul className="mt-5 space-y-2.5 text-sm">
                  {t.home.patients.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary-strong" aria-hidden />
                      {point}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-7">
                  <Link href="/signup" className={`w-full ${buttonVariants({ size: "md" })}`}>
                    {t.home.signUp}
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div id="pharmacies" className="flex h-full flex-col rounded-lg border border-border bg-card p-8">
                <span className="flex size-10 items-center justify-center rounded-full bg-primary-subtle text-primary-strong">
                  <Store className="size-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-xl font-semibold tracking-tight">{t.home.pharmacies.title}</h3>
                <p className="mt-2 text-sm text-pretty text-muted-foreground">{t.home.pharmacies.body}</p>
                <ul className="mt-5 space-y-2.5 text-sm">
                  {t.home.pharmacies.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary-strong" aria-hidden />
                      {point}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-7">
                  <Link
                    href="/signup/pharmacy"
                    className={`w-full ${buttonVariants({ variant: "outline", size: "md" })}`}
                  >
                    {t.home.listPharmacy}
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Closing CTA: one primary action, one quiet alternative. */}
        <section className="border-y border-border bg-primary-subtle">
          <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28 lg:py-32">
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
                {t.home.finalCta.title}
              </h2>
              <p className="mt-4 text-pretty text-muted-foreground">{t.home.finalCta.body}</p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a href="#search" className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}>
                  <Search className="size-4" aria-hidden />
                  {t.home.finalCta.primary}
                </a>
                <Link
                  href="/signup/pharmacy"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "w-full bg-card sm:w-auto",
                  )}
                >
                  {t.home.finalCta.secondary}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-10 text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <Logo asLink={false} />
          <span>{interpolate(t.home.copyright, { year: new Date().getFullYear() })}</span>
          <span>{t.home.footerTrust}</span>
        </div>
      </footer>
    </div>
  );
}
