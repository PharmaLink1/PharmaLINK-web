"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/i18n";
import { MedicineSearch } from "@/components/dashboard/medicine-search";

// Patient home hero: one full-bleed photograph, one headline, the live search.
// Nothing else competes, so the search reads as the product.
//
// The photo is a 2400px JPEG (~260KB on disk): "White Tablets in Close Up Shot" by
// Etatics Inc., Pexels photo 12585202, Pexels License. Next serves it as WebP at roughly
// 80KB on desktop and 27KB on mobile. One unbranded blister reads as medicine without
// looking like a product ad.
// A soft ivory pool is painted over it so the centered copy keeps full contrast at any
// crop while the photo still reads to the edges.
//
// Responsive intent: the section fills the viewport at every width; the header floats
// above it. The image is free of people and branding so it works for both patient and
// pharmacy audiences and never competes with the copy.
export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative isolate flex min-h-svh flex-col justify-center overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <Image
          src="/img/hero-tablets.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[64%_45%] saturate-[0.94] dark:opacity-35 dark:saturate-[0.5]"
        />

        {/* A luminous pool of canvas under the copy, thinning toward the frame edges. */}
        <div className="absolute inset-0 bg-background/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_64%_56%_at_50%_45%,var(--background)_0%,var(--background)_34%,transparent_82%)] opacity-95" />
        {/* Settle into the tagline section below. */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-background to-transparent" />
      </div>

      <div className="mx-auto w-full max-w-2xl px-6 pb-16 pt-32 text-center sm:pt-36 [@media(max-height:520px)]:pb-0 [@media(max-height:520px)]:pt-20">
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-7xl [@media(max-height:520px)]:text-3xl">
          {t.hero.titlePart1}
          <br />
          {t.hero.titlePart2}
        </h1>

        <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg [@media(max-height:520px)]:mt-3 [@media(max-height:520px)]:text-sm [@media(max-height:380px)]:hidden">
          {t.hero.subtitle}
        </p>

        <div id="search" className="mt-8 scroll-mt-28 text-left sm:mt-10 [@media(max-height:520px)]:mt-5">
          <MedicineSearch variant="hero" />
        </div>
      </div>
    </section>
  );
}
