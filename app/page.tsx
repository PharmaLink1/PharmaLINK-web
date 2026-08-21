import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
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

const features = [
  { icon: Search, title: "Search any medicine", body: "Find a medicine by brand or generic name and see who has it right now." },
  { icon: MapPin, title: "Nearby pharmacies", body: "See which pharmacies near you stock it, sorted by distance." },
  { icon: Tag, title: "Compare prices", body: "Compare prices in ETB before you travel — no more calling around." },
  { icon: Clock, title: "Fresh stock status", body: "Every listing shows when it was last updated, so you know it's current." },
  { icon: BadgeCheck, title: "Plain-language info", body: "Understand what a medicine is for and how to take it, safely." },
  { icon: Bell, title: "Refill reminders", body: "Get a nudge before you run out of your regular medication." },
];

const steps = [
  { n: "1", title: "Search", body: "Type the medicine you need." },
  { n: "2", title: "Compare", body: "See nearby pharmacies, stock, and prices." },
  { n: "3", title: "Go", body: "Head to the pharmacy that works for you." },
];

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 pb-16 pt-16 sm:pt-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-subtle px-3 py-1 text-sm font-medium text-primary-hover">
              <MapPin className="size-4" aria-hidden />
              For patients & pharmacies in Ethiopia
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
              Find the medicine you need, at a pharmacy near you.
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              PharmaLink shows which nearby pharmacies have your medicine in stock, what it
              costs, and how to take it — so you stop calling around.
            </p>

            {/* Mock search affordance → routes to sign up */}
            <div className="mx-auto mt-8 flex max-w-md items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-sm">
              <span className="flex items-center pl-2 text-muted-foreground">
                <Search className="size-5" aria-hidden />
              </span>
              <span className="flex-1 truncate text-left text-muted-foreground">
                Search a medicine, e.g. Paracetamol
              </span>
              <Link href="/signup" className={buttonVariants({ size: "sm" })}>
                Get started
              </Link>
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              <Link href="/signup" className={buttonVariants({ size: "lg" })}>
                Create account
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link href="/signin" className={buttonVariants({ variant: "outline", size: "lg" })}>
                Sign in
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-y border-border bg-muted/40">
          <div className="mx-auto grid max-w-4xl gap-6 px-6 py-14 sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.n} className="flex flex-col items-center text-center">
                <span className="flex size-10 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                  {step.n}
                </span>
                <h3 className="mt-3 font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, body }) => (
              <Card key={title} className="p-5">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Pharmacy (supply-side) callout */}
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <Card className="flex flex-col items-start gap-5 bg-gradient-to-br from-primary to-primary-hover p-8 text-primary-foreground sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-primary-foreground/80">
                <Store className="size-4" aria-hidden />
                For pharmacies
              </span>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Reach more patients. Keep stock and prices current in seconds.
              </h2>
              <p className="mt-2 text-primary-foreground/85">
                Join PharmaLink and let nearby patients find what you have in stock.
              </p>
            </div>
            <Link
              href="/signup"
              className="inline-flex h-12 shrink-0 items-center gap-2 rounded-md bg-white px-5 font-medium text-primary transition-colors hover:bg-white/90"
            >
              List your pharmacy
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Card>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} PharmaLink</span>
          <span className="inline-flex items-center gap-1.5">
            <Languages className="size-4" aria-hidden />
            Amharic & English
          </span>
        </div>
      </footer>
    </div>
  );
}
