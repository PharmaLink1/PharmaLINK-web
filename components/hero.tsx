"use client";

import Image from "next/image";
import { HeartHandshake, RefreshCw, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { MedicineSearch } from "@/components/dashboard/medicine-search";

// Patient home hero: one full-bleed photograph, one headline, the live search docked low.
// The quiet trust row fills the middle so the screen never feels empty, while the search
// still reads as the destination.
//
// The photo is a 2400px JPEG (~260KB on disk): "White Tablets in Close Up Shot" by
// Etatics Inc., Pexels photo 12585202, Pexels License. Next serves it as WebP at roughly
// 80KB on desktop and 27KB on mobile. One unbranded blister reads as medicine without
// looking like a product ad.
// A soft pool of canvas sits behind the headline only, so the photograph still reads
// through the middle instead of flattening into a blank field. Dark mode turns the
// photo grayscale at 65% so the hero reads as night-time and matches the black canvas,
// while the blister stays recognizable.
//
// Responsive intent: the section fills the viewport at every width; the header floats
// above it. Copy sits high, the search sits at the bottom, and short viewports compress
// the middle rather than pushing the search below the fold.
export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative isolate flex min-h-svh flex-col overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <Image
          src="/img/hero-tablets.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[64%_45%] saturate-[0.94] dark:opacity-[0.65] dark:grayscale dark:brightness-105"
        />

        {/* A luminous pool of canvas under the copy, thinning toward the frame edges. */}
        <div className="absolute inset-0 bg-background/30 dark:bg-background/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_46%_34%_at_50%_36%,var(--background)_0%,color-mix(in_oklab,var(--background)_68%,transparent)_55%,transparent_80%)]" />
        {/* Settle into the tagline section below. */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-background to-transparent" />
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 pb-5 pt-28 text-center sm:px-6 sm:pb-8 sm:pt-40 [@media(max-height:520px)]:pb-2 [@media(max-height:520px)]:pt-16">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-7xl [@media(max-height:520px)]:text-3xl">
            {t.hero.titlePart1}
            <br />
            {t.hero.titlePart2}
          </h1>

          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg [@media(max-height:520px)]:mt-3 [@media(max-height:520px)]:text-sm [@media(max-height:380px)]:hidden">
            {t.hero.subtitle}
          </p>
        </div>

        {/* Trust markers, not another block of copy: three product promises fill the
            middle while the photo carries the rest. */}
        <ul className="mx-auto mt-7 flex max-w-2xl flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground sm:mt-9 sm:gap-x-7 sm:text-sm [@media(max-height:520px)]:hidden">
          <li className="inline-flex items-center gap-1.5">
            <ShieldCheck className="size-4 shrink-0 text-primary-strong" aria-hidden />
            {t.hero.trustPharmacies}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <RefreshCw className="size-4 shrink-0 text-primary-strong" aria-hidden />
            {t.hero.trustUpdated}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <HeartHandshake className="size-4 shrink-0 text-primary-strong" aria-hidden />
            {t.hero.trustFree}
          </li>
        </ul>

        <div
          id="search"
          className="mt-auto w-full scroll-mt-28 pt-10 text-left [@media(max-height:520px)]:pt-4"
        >
          <MedicineSearch variant="hero" />
          <p className="mt-3 text-center text-xs text-muted-foreground [@media(max-height:600px)]:hidden">
            {t.hero.previewNote}
          </p>
        </div>
      </div>
    </section>
  );
}
