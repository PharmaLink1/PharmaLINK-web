import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  ChevronDown,
  Clock,
  Languages,
  MapPin,
  Search,
  Store,
  Tag,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CornerTicks } from "@/components/ui/corner-ticks";

const features = [
  { icon: Search, title: "Search any medicine", body: "Find a medicine by brand or generic name and see who has it right now." },
  { icon: MapPin, title: "Nearby pharmacies", body: "See which pharmacies near you stock it, sorted by distance." },
  { icon: Tag, title: "Compare prices", body: "Compare prices in ETB before you travel — no more calling around." },
  { icon: Clock, title: "Fresh stock status", body: "Every listing shows when it was last updated, so you know it's current." },
  { icon: BadgeCheck, title: "Plain-language info", body: "Understand what a medicine is for and how to take it, safely." },
  { icon: Bell, title: "Refill reminders", body: "Get a nudge before you run out of your regular medication." },
];

const steps = [
  { n: "01", title: "Search", body: "Type the medicine you need." },
  { n: "02", title: "Compare", body: "See nearby pharmacies, stock, and prices." },
  { n: "03", title: "Go", body: "Head to the pharmacy that works for you." },
];

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero — fills the first screen; the rest appears on scroll */}
        <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col">
          <div className="flex flex-1 items-center">
            <div className="mx-auto max-w-2xl px-6 text-center">
              <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-primary sm:text-xs">
                <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                Medicine finder · Ethiopia
              </span>
              <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
                Find the medicine you need,{" "}
                <span className="box-decoration-clone rounded-sm bg-primary/15 px-1.5 text-primary">
                  at a pharmacy near you.
                </span>
              </h1>
              <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                PharmaLink shows which nearby pharmacies have your medicine in stock, what it
                costs, and how to take it — so you stop calling around.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/signup" className={`w-full sm:w-44 ${buttonVariants({ size: "md" })}`}>
                  Create account
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
                <Link href="/signin" className={`w-full sm:w-44 ${buttonVariants({ variant: "outline", size: "md" })}`}>
                  Sign in
                </Link>
              </div>
            </div>
          </div>

          {/* farming-labs style bottom strip */}
          <div className="mx-auto w-full max-w-6xl px-6 pb-6">
            <div className="flex items-center justify-between border-t border-border/50 pt-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              <span>Amharic &amp; English</span>
              <span className="hidden items-center gap-1.5 sm:flex">
                <ChevronDown className="size-3.5 animate-bounce" aria-hidden />
                Scroll to explore
              </span>
              <span>Free to use</span>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="border-y border-border bg-card/30">
          <div className="mx-auto max-w-4xl px-6 py-14">
            <p className="mb-8 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
              How it works
            </p>
            <div className="grid gap-8 sm:grid-cols-3 sm:gap-6">
              {steps.map((step) => (
                <div key={step.n} className="flex flex-col items-center text-center">
                  <span className="flex size-10 items-center justify-center rounded-md border border-primary/30 bg-primary-subtle font-mono text-sm font-semibold text-primary">
                    {step.n}
                  </span>
                  <h3 className="mt-3 font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-6 py-16">
          <p className="mb-8 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            What you can do
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, body }) => (
              <Card key={title} className="relative p-5 transition-colors hover:border-primary/40">
                <CornerTicks className="border-border" size="size-2" />
                <span className="flex size-10 items-center justify-center rounded-md bg-primary-subtle text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Pharmacy (supply-side) callout */}
        <section id="pharmacies" className="mx-auto max-w-6xl px-6 pb-20">
          <Card className="relative flex flex-col items-start gap-5 overflow-hidden p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-[320px] w-[320px] rounded-full bg-primary/15 blur-[100px]" />
            <div className="relative max-w-xl">
              <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
                <Store className="size-4" aria-hidden />
                For pharmacies
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                Reach more patients. Keep stock and prices current in seconds.
              </h2>
              <p className="mt-2 text-muted-foreground">
                Join PharmaLink and let nearby patients find what you have in stock.
              </p>
            </div>
            <Link href="/signup" className={`relative w-full shrink-0 sm:w-auto ${buttonVariants({ size: "md" })}`}>
              List your pharmacy
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Card>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-muted-foreground sm:flex-row">
          <span className="font-mono text-xs">© {new Date().getFullYear()} PharmaLink</span>
          <span className="inline-flex items-center gap-1.5">
            <Languages className="size-4" aria-hidden />
            Amharic &amp; English
          </span>
        </div>
      </footer>
    </div>
  );
}
