"use client";

import Link from "next/link";
import { ArrowRight, Check, CheckCircle2, Store, UserRound } from "lucide-react";
import { cn } from "@/lib/cn";
import { useLanguage, interpolate } from "@/lib/i18n";
import { SiteHeader } from "@/components/layout/site-header";
import { HeroSection } from "@/components/hero";
import { buttonVariants } from "@/components/ui/button";

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
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-medium text-primary-strong">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      <p className="mt-3 text-muted-foreground">{body}</p>
    </div>
  );
}

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="flex-1">
        <HeroSection />

        {/* Compare prices - the price-comparison surface, drawn in CSS (no image) */}
        <section id="compare" className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading
            eyebrow={t.home.compare.eyebrow}
            title={t.home.compare.title}
            body={t.home.compare.body}
          />

         {/* Mobile: stacked price cards, table on sm+ */}

          {/* Mobile: minimal rows - name + price on one line, quiet meta below */}
          <ul className="mx-auto mt-10 max-w-3xl divide-y divide-border overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-sm sm:hidden">
            {compareRows.map((row) => (
              <li key={row.id} className={cn("px-4 py-3.5", row.best && "bg-primary-subtle/40")}>
                <div className="flex items-center justify-between gap-3">
                  <p className="min-w-0 truncate text-sm font-medium">{row.name}</p>
                  <p className="shrink-0 text-sm font-semibold tabular-nums">{row.price}</p>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                 {row.best && (
                   <span className="inline-flex items-center gap-1 font-medium text-primary-strong">
                     <CheckCircle2 className="size-3.5" aria-hidden />
                     {t.home.bestPrice}
                   </span>
                 )}
                  {row.best && <span aria-hidden>&middot;</span>}
                 <span>{row.distance}</span>
                 <span aria-hidden>&middot;</span>
                  <span className={cn("font-medium", row.stock === "in" ? "text-success" : "text-warning")}>
                    {row.stock === "in" ? t.common.inStock : t.common.lowStock}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="mx-auto mt-10 hidden max-w-3xl overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-sm sm:block">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">{t.home.compareCaption}</caption>
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <th scope="col" className="px-4 py-3 font-medium sm:px-5">{t.home.columns.pharmacy}</th>
                  <th scope="col" className="hidden px-4 py-3 font-medium sm:table-cell">{t.home.columns.distance}</th>
                  <th scope="col" className="px-4 py-3 font-medium">{t.home.columns.stock}</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">{t.home.columns.price}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {compareRows.map((row) => (
                  <tr key={row.id} className={cn(row.best && "bg-primary-subtle/40")}>
                    <td className="px-4 py-4 font-medium sm:px-5">{row.name}</td>
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
                    <td className="px-4 py-4 text-right font-semibold tabular-nums">{row.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            {t.home.compareFootnote}
          </p>
        </section>

        {/* How it works */}
        <section id="how" className="border-y border-border bg-card">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <SectionHeading
              eyebrow={t.home.how.eyebrow}
              title={t.home.how.title}
              body={t.home.how.body}
            />
            <div className="mx-auto mt-12 grid max-w-5xl gap-10 sm:grid-cols-3 sm:gap-8">
              {t.home.steps.map((step, index) => (
                <div key={step.title} className="border-t border-border pt-5">
                  <p className="text-xs font-semibold tracking-widest text-primary-strong">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-3 font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who it's for - patients & pharmacies */}
        <section id="audiences" className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading
            eyebrow={t.home.audiences.eyebrow}
            title={t.home.audiences.title}
            body={t.home.audiences.body}
          />
          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            <div className="flex flex-col rounded-[var(--radius)] border border-border bg-card p-8">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary-subtle text-primary-strong">
                <UserRound className="size-5" aria-hidden />
              </span>
              <h3 className="mt-5 text-xl font-semibold tracking-tight">{t.home.patients.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t.home.patients.body}</p>
              <ul className="mt-5 space-y-2.5 text-sm">
                {t.home.patients.points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary-strong" aria-hidden />
                    {point}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-7">
                <Link
                  href="/signup"
                  className={`w-full ${buttonVariants({ size: "md" })}`}
                >
                  {t.home.signUp}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </div>

            <div id="pharmacies" className="flex flex-col rounded-[var(--radius)] border border-border bg-card p-8">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary-subtle text-primary-strong">
                <Store className="size-5" aria-hidden />
              </span>
              <h3 className="mt-5 text-xl font-semibold tracking-tight">{t.home.pharmacies.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t.home.pharmacies.body}</p>
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
                  className={`w-full ${buttonVariants({ size: "md" })}`}
                >
                  {t.home.listPharmacy}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 py-10 text-sm text-muted-foreground sm:flex-row sm:justify-between sm:py-8">
          <span>{interpolate(t.home.copyright, { year: new Date().getFullYear() })}</span>
          <span>{t.home.footerTrust}</span>
        </div>
      </footer>
    </div>
  );
}
