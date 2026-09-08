"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage, interpolate } from "@/lib/i18n";
import { buttonVariants } from "@/components/ui/button";
import { DecorIcon } from "@/components/decor-icon";
import { FullWidthDivider } from "@/components/full-width-divider";

type StockLevel = "in" | "low";

interface SampleListing {
  id: string;
  name: string;
  category: string;
  pharmacy: string;
  distance: string;
  updated: string;
  stock: StockLevel;
  price: string;
}

const allSampleResults: SampleListing[] = [
  {
    id: "amox-1",
    name: "Amoxicillin 500mg",
    category: "Antibiotic",
    pharmacy: "Care Pharmacy",
    distance: "1.2 km",
    updated: "2h",
    stock: "in",
    price: "ETB 85",
  },
  {
    id: "amox-2",
    name: "Amoxicillin 500mg",
    category: "Antibiotic",
    pharmacy: "Zemen Drugstore",
    distance: "2.4 km",
    updated: "5h",
    stock: "low",
    price: "ETB 92",
  },
  {
    id: "amox-3",
    name: "Amoxicillin 500mg",
    category: "Antibiotic",
    pharmacy: "St. Mary Pharmacy",
    distance: "3.1 km",
    updated: "8h",
    stock: "in",
    price: "ETB 98",
  },
  {
    id: "met-1",
    name: "Metformin 500mg",
    category: "Diabetes",
    pharmacy: "Lion Pharmacy",
    distance: "0.8 km",
    updated: "1h",
    stock: "in",
    price: "ETB 65",
  },
  {
    id: "omep-1",
    name: "Omeprazole 20mg",
    category: "Antacid",
    pharmacy: "Abyssinia Pharmacy",
    distance: "1.5 km",
    updated: "3h",
    stock: "in",
    price: "ETB 110",
  },
  {
    id: "para-1",
    name: "Paracetamol 500mg",
    category: "Pain relief",
    pharmacy: "Bole Meds",
    distance: "1.9 km",
    updated: "4h",
    stock: "in",
    price: "ETB 30",
  },
];

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="overflow-x-clip">
      {/* Hero copy: badge, headline, subtitle, and CTAs. Search lives on the dashboard. */}
      <div className="relative flex flex-col px-4 pt-14 pb-10 sm:pt-20 sm:pb-12 md:px-6 md:pt-24 md:pb-14 lg:pt-44">
        {/* Faded vertical rules - efferd hero structure */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 size-full overflow-hidden">
          <div className="absolute inset-y-0 left-4 w-px bg-linear-to-b from-transparent via-border to-border md:left-8" />
          <div className="absolute inset-y-0 right-4 w-px bg-linear-to-b from-transparent via-border to-border md:right-8" />
          <div className="absolute inset-y-0 left-8 w-px bg-linear-to-b from-transparent via-border/50 to-border/50 md:left-12" />
          <div className="absolute inset-y-0 right-8 w-px bg-linear-to-b from-transparent via-border/50 to-border/50 md:right-12" />
        </div>

        <div className="flex w-full flex-1 flex-col items-center justify-center text-center">
          {/* Live badge */}
          <a
            href="#audiences"
            className="inline-flex w-fit items-center gap-2.5 rounded-full border border-border/80 bg-card/80 py-1 pl-2 pr-3 text-xs text-muted-foreground backdrop-blur-md transition-colors hover:border-primary/40 hover:text-foreground sm:text-sm"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-subtle px-2 py-0.5 text-xs font-semibold text-primary-strong">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden />
              {t.hero.live}
            </span>
            <span>{t.hero.builtForEthiopia}</span>
            <span className="block h-3.5 border-l border-border" aria-hidden />
            <ArrowRight className="size-3 text-muted-foreground" aria-hidden />
          </a>

          {/* Headline */}
          <h1 className="mt-6 max-w-3xl text-balance text-3xl font-semibold tracking-tight text-foreground sm:mt-8 sm:text-4xl md:text-5xl lg:text-6xl">
            {t.hero.titlePart1}
            <br />
            <span className="text-primary-strong">{t.hero.titlePart2}</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 max-w-xl text-balance text-sm font-normal text-muted-foreground sm:mt-5 sm:text-base">
            {t.hero.subtitle}
          </p>

          {/* CTAs: patient search + pharmacy onboarding */}
          <div className="mt-7 flex w-full flex-col items-center justify-center gap-3 sm:mt-9 sm:w-auto sm:flex-row sm:gap-4">
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ size: "md" }), "w-full sm:w-auto")}
            >
              {t.hero.findMedicine}
              <ArrowRight className="ml-1.5 size-4" aria-hidden />
            </Link>
            <Link
              href="/signup/pharmacy"
              className={cn(buttonVariants({ variant: "outline", size: "md" }), "w-full sm:w-auto")}
            >
              {t.hero.listPharmacy}
            </Link>
          </div>
        </div>
      </div>

      {/* Product preview: static sample of the search-results surface */}
      <div className="relative mx-auto w-full max-w-5xl px-4 pb-4 sm:pb-6 lg:mt-36">
        <DecorIcon className="hidden size-4 xl:block" position="top-left" />
        <DecorIcon className="hidden size-4 xl:block" position="top-right" />
        <DecorIcon className="hidden size-4 xl:block" position="bottom-left" />
        <DecorIcon className="hidden size-4 xl:block" position="bottom-right" />

        <FullWidthDivider className="-top-px" />
        <div className="overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-sm">
          {/* Preview header: sample search context */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="truncate text-sm font-medium text-foreground">
                {t.hero.sampleSearch}
              </span>
            </div>
            <span className="shrink-0 rounded-full bg-primary-subtle px-2.5 py-0.5 text-xs font-semibold text-primary-strong">
              {t.hero.resultCount}
            </span>
          </div>

          {/* Sample result rows */}
          <ul className="divide-y divide-border">
            {allSampleResults.map((result) => (
              <li
                key={result.id}
                className="flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{result.name}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {result.pharmacy} &middot; {result.distance} &middot;{" "}
                    {interpolate(t.hero.updatedAgo, { time: result.updated })}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                      result.stock === "in"
                        ? "bg-success-subtle text-success"
                        : "bg-warning-subtle text-warning",
                    )}
                  >
                    {result.stock === "in" && (
                      <CheckCircle2 className="size-3.5" aria-hidden />
                    )}
                    {result.stock === "in" ? t.common.inStock : t.common.lowStock}
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {result.price}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <FullWidthDivider className="-bottom-px" />
      </div>
    </section>
  );
}