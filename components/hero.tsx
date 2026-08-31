import Link from "next/link";
import { ArrowRight, CheckCircle2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { DecorIcon } from "@/components/decor-icon";
import { FullWidthDivider } from "@/components/full-width-divider";

const results = [
  {
    id: "care",
    name: "Amoxicillin 500mg",
    meta: "Care Pharmacy · 1.2 km · updated 2h ago",
    stock: "In stock",
    stockClass: "bg-success-subtle text-success",
    price: "ETB 85",
  },
  {
    id: "zemen",
    name: "Amoxicillin 500mg",
    meta: "Zemen Drugstore · 2.4 km · updated 5h ago",
    stock: "Low stock",
    stockClass: "bg-warning-subtle text-warning",
    price: "ETB 92",
  },
];

export function HeroSection() {
  return (
    <section>
      <div className="relative flex flex-col items-center justify-center gap-5 px-4 pb-14 pt-16 md:px-4 md:pb-20 md:pt-24 lg:pt-28">
        {/* Faded vertical rules - efferd hero structure */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 size-full overflow-hidden">
          <div className="absolute inset-y-0 left-4 w-px bg-linear-to-b from-transparent via-border to-border md:left-8" />
          <div className="absolute inset-y-0 right-4 w-px bg-linear-to-b from-transparent via-border to-border md:right-8" />
          <div className="absolute inset-y-0 left-8 w-px bg-linear-to-b from-transparent via-border/50 to-border/50 md:left-12" />
          <div className="absolute inset-y-0 right-8 w-px bg-linear-to-b from-transparent via-border/50 to-border/50 md:right-12" />
        </div>

        {/* Status pill */}
        <a
          href="#audiences"
          className="group fade-in slide-in-from-bottom-10 mx-auto flex w-fit animate-in items-center gap-2.5 rounded-md border bg-card py-1.5 pl-2 pr-3 text-sm text-muted-foreground fill-mode-backwards transition-colors delay-500 duration-500 ease-out hover:text-foreground"
        >
          <span className="inline-flex items-center gap-1.5 rounded-md bg-primary-subtle px-2.5 py-0.5 text-xs font-semibold text-primary-strong">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden />
            LIVE
          </span>
          Built for Ethiopia
          <span className="block h-4 border-l" aria-hidden />
          <ArrowRight
            className="size-3.5 -translate-x-0.5 duration-150 ease-out group-hover:translate-x-0.5"
            aria-hidden
          />
        </a>

        <h1 className="max-w-3xl text-balance text-center text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl">
          Find the medicine you need,{" "}
          <span className="text-primary-strong">at a pharmacy near you.</span>
        </h1>

        <p className="fade-in slide-in-from-bottom-10 max-w-xl animate-in text-balance text-center text-sm font-light text-muted-foreground/80 fill-mode-backwards delay-200 duration-500 ease-out sm:text-base">
          Search a medicine and instantly see which nearby pharmacies have it in stock,
          what it costs in ETB, and how to take it - without calling around.
        </p>

        <div className="fade-in slide-in-from-bottom-10 flex w-fit animate-in flex-col items-center justify-center gap-3 fill-mode-backwards pt-2 delay-300 duration-500 ease-out sm:flex-row">
          <Link
            href="/signup"
            className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
          >
            Find a medicine
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link
            href="/signup/pharmacy"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "w-full sm:w-auto",
            )}
          >
            List your pharmacy
          </Link>
        </div>

        <p className="text-sm text-muted-foreground">
          Free for patients &middot; Prices in ETB &middot; Amharic &amp; English
        </p>
      </div>

      {/* Product mock - image-free, framed like the efferd screen */}
      <div className="relative mx-auto w-full max-w-5xl px-4">
        <DecorIcon className="size-4" position="top-left" />
        <DecorIcon className="size-4" position="top-right" />
        <DecorIcon className="size-4" position="bottom-left" />
        <DecorIcon className="size-4" position="bottom-right" />

        <FullWidthDivider className="-top-px" />
        <div className="overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="truncate text-sm text-muted-foreground">
              amoxicillin 500mg
            </span>
            <span className="ml-auto shrink-0 rounded-full bg-primary-subtle px-2.5 py-0.5 text-xs font-semibold text-primary-strong">
              6 results
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
                    {result.meta}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                      result.stockClass,
                    )}
                  >
                    {result.stock === "In stock" && (
                      <CheckCircle2 className="size-3.5" aria-hidden />
                    )}
                    {result.stock}
                  </span>
                  <span className="text-sm font-semibold tabular-nums">
                    {result.price}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <p className="border-t border-border px-4 py-3 text-center text-xs text-muted-foreground">
            3 more pharmacies nearby
          </p>
        </div>
        <FullWidthDivider className="-bottom-px" />
      </div>
    </section>
  );
}