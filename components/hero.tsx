"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage, interpolate } from "@/lib/i18n";
import { buttonVariants } from "@/components/ui/button";
import { DecorIcon } from "@/components/decor-icon";
import { FullWidthDivider } from "@/components/full-width-divider";

type StockLevel = "in" | "low";

const results: {
  id: string;
  name: string;
  pharmacy: string;
  distance: string;
  updated: string;
  stock: StockLevel;
  price: string;
}[] = [
  {
    id: "care",
    name: "Amoxicillin 500mg",
    pharmacy: "Care Pharmacy",
    distance: "1.2 km",
    updated: "2h",
    stock: "in",
    price: "ETB 85",
  },
  {
    id: "zemen",
    name: "Amoxicillin 500mg",
    pharmacy: "Zemen Drugstore",
    distance: "2.4 km",
    updated: "5h",
    stock: "low",
    price: "ETB 92",
  },
  {
    id: "stmary",
    name: "Amoxicillin 500mg",
    pharmacy: "St. Mary Pharmacy",
    distance: "3.1 km",
    updated: "8h",
    stock: "in",
    price: "ETB 98",
  },
];


export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="overflow-x-clip">
      <div className="relative flex min-h-[calc(100svh-8rem)] flex-col px-4 py-10 md:px-4 md:py-16">
        {/* Faded vertical rules - efferd hero structure */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 size-full overflow-hidden">
          <div className="absolute inset-y-0 left-4 w-px bg-linear-to-b from-transparent via-border to-border md:left-8" />
          <div className="absolute inset-y-0 right-4 w-px bg-linear-to-b from-transparent via-border to-border md:right-8" />
          <div className="absolute inset-y-0 left-8 w-px bg-linear-to-b from-transparent via-border/50 to-border/50 md:left-12" />
          <div className="absolute inset-y-0 right-8 w-px bg-linear-to-b from-transparent via-border/50 to-border/50 md:right-12" />
        </div>

        <div className="flex w-full flex-1 flex-col items-center justify-center gap-5">
          <a
            href="#audiences"
            className="inline-flex w-fit items-center gap-2.5 rounded-md border bg-card py-1.5 pl-2 pr-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="inline-flex items-center gap-1.5 rounded-md bg-primary-subtle px-2.5 py-0.5 text-xs font-semibold text-primary-strong">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden />
              {t.hero.live}
            </span>
            {t.hero.builtForEthiopia}
            <span className="block h-4 border-l" aria-hidden />
            <ArrowRight className="size-3.5" aria-hidden />
          </a>

          <h1 className="max-w-3xl text-balance text-center text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            {t.hero.titlePart1}
            <br />
            <span className="text-primary-strong">{t.hero.titlePart2}</span>
          </h1>

          <p className="fade-in slide-in-from-bottom-10 max-w-xl animate-in text-balance text-center text-sm font-light text-muted-foreground/80 fill-mode-backwards delay-200 duration-500 ease-out sm:text-base">
            {t.hero.subtitle}
          </p>

          <div className="fade-in slide-in-from-bottom-10 flex w-fit animate-in flex-col items-center justify-center gap-3 fill-mode-backwards pt-2 delay-300 duration-500 ease-out sm:flex-row">
            <Link
              href="/signup"
              className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
            >
              {t.hero.findMedicine}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/signup/pharmacy"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "w-full sm:w-auto",
              )}
            >
              {t.hero.listPharmacy}
            </Link>
          </div>
        </div>

      </div>

      {/* Product mock - image-free, framed like the efferd screen */}
      <div className="relative mx-auto w-full max-w-5xl px-4">
        <DecorIcon className="hidden size-4 xl:block" position="top-left" />
        <DecorIcon className="hidden size-4 xl:block" position="top-right" />
        <DecorIcon className="hidden size-4 xl:block" position="bottom-left" />
        <DecorIcon className="hidden size-4 xl:block" position="bottom-right" />

        <FullWidthDivider className="-top-px" />
        <div className="overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="truncate text-sm text-muted-foreground">
              {t.hero.sampleSearch}
            </span>
            <span className="ml-auto shrink-0 rounded-full bg-primary-subtle px-2.5 py-0.5 text-xs font-semibold text-primary-strong">
              {t.hero.resultCount}
            </span>
          </div>
          <ul className="divide-y divide-border">
            {results.map((result) => (
              <li
                key={result.id}
                className="flex items-center justify-between gap-3 px-4 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{result.name}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {result.pharmacy} · {result.distance} ·{" "}
                    {interpolate(t.hero.updatedAgo, { time: result.updated })}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
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
                  <span className="text-sm font-semibold tabular-nums">
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
