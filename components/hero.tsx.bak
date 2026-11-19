"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";
import { buttonVariants } from "@/components/ui/button";
import { DecorIcon } from "@/components/decor-icon";
import { FullWidthDivider } from "@/components/full-width-divider";
import { MedicineSearch } from "@/components/dashboard/medicine-search";

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="overflow-x-clip">
      {/* Hero copy: badge, headline, subtitle, and CTAs. */}
      <div className="relative flex min-h-[calc(100svh-8rem)] flex-col px-4 py-10 md:px-4 md:py-16">
        {/* Faded vertical rules - efferd hero structure */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 size-full overflow-hidden">
          <div className="absolute inset-y-0 left-4 w-px bg-linear-to-b from-transparent via-border to-border md:left-8" />
          <div className="absolute inset-y-0 right-4 w-px bg-linear-to-b from-transparent via-border to-border md:right-8" />
          <div className="absolute inset-y-0 left-8 w-px bg-linear-to-b from-transparent via-border/50 to-border/50 md:left-12" />
          <div className="absolute inset-y-0 right-8 w-px bg-linear-to-b from-transparent via-border/50 to-border/50 md:right-12" />
        </div>

        <div className="flex w-full flex-1 flex-col items-center justify-center gap-5">
          {/* Live badge */}
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

          {/* Headline */}
          <h1 className="max-w-3xl text-balance text-center text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            {t.hero.titlePart1}
            <br />
            <span className="text-primary-strong">{t.hero.titlePart2}</span>
          </h1>

          {/* Subtitle */}
          <p className="fade-in slide-in-from-bottom-10 max-w-xl animate-in text-balance text-center text-sm font-light text-muted-foreground/80 fill-mode-backwards delay-200 duration-500 ease-out sm:text-base">
            {t.hero.subtitle}
          </p>

          {/* CTAs: patient search + pharmacy onboarding */}
          <div className="fade-in slide-in-from-bottom-10 flex w-fit animate-in flex-col items-center justify-center gap-3 fill-mode-backwards pt-2 delay-300 duration-500 ease-out sm:flex-row">
            <a
              href="#search"
              className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
            >
              {t.hero.findMedicine}
              <ArrowRight className="size-4" aria-hidden />
            </a>
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

      {/* Live medicine search - open to guests, no sign-in needed */}
      <div id="search" className="relative mx-auto w-full max-w-3xl scroll-mt-24 px-4 pb-16">
        <DecorIcon className="hidden size-4 xl:block" position="top-left" />
        <DecorIcon className="hidden size-4 xl:block" position="top-right" />

        <FullWidthDivider className="-top-px" />
        <MedicineSearch />
      </div>
    </section>
  );
}