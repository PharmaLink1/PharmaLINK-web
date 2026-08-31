import Link from "next/link";
import { ArrowRight, Check, CheckCircle2, Store, UserRound } from "lucide-react";
import { cn } from "@/lib/cn";
import { SiteHeader } from "@/components/layout/site-header";
import { HeroSection } from "@/components/hero";
import { buttonVariants } from "@/components/ui/button";

const steps = [
  { n: "01", title: "Search", body: "Type the medicine you need - by brand or generic name." },
  { n: "02", title: "Compare", body: "See nearby pharmacies, stock, and price in ETB." },
  { n: "03", title: "Go", body: "Head to the pharmacy that works best for you." },
];

const patientPoints = [
  "Search by brand or generic name",
  "Compare stock, price, and distance",
  "Drug info in Amharic and English",
];

const pharmacyPoints = [
  "List your medicines in minutes",
  "Update stock and prices in seconds",
  "Reach patients searching near you",
];

const compareRows = [
  { id: "care", name: "Care Pharmacy", distance: "1.2 km", stock: "In stock", stockClass: "bg-success-subtle text-success", price: "ETB 85", best: true },
  { id: "zemen", name: "Zemen Drugstore", distance: "2.4 km", stock: "Low stock", stockClass: "bg-warning-subtle text-warning", price: "ETB 92", best: false },
  { id: "stmary", name: "St. Mary Pharmacy", distance: "3.1 km", stock: "In stock", stockClass: "bg-success-subtle text-success", price: "ETB 98", best: false },
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
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="flex-1">
        <HeroSection />

        {/* Compare prices - the price-comparison surface, drawn in CSS (no image) */}
        <section id="compare" className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading
            eyebrow="Compare in ETB"
            title="Same medicine. Better price."
            body="We only connect you with pharmacies near you. See who has it in stock and what it costs, then go pay at the counter - PharmaLink never charges you."
          />

          <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-sm">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">
                Amoxicillin 500mg prices at nearby pharmacies
              </caption>
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <th scope="col" className="px-4 py-3 font-medium sm:px-5">Pharmacy</th>
                  <th scope="col" className="hidden px-4 py-3 font-medium sm:table-cell">Distance</th>
                  <th scope="col" className="px-4 py-3 font-medium">Stock</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {compareRows.map((row) => (
                  <tr key={row.id} className={cn("transition-colors", row.best && "bg-primary-subtle/50")}>
                    <td className="px-4 py-4 sm:px-5">
                      <span className="flex items-center gap-2 font-medium">
                        {row.name}
                        {row.best && (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                            Best price
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="hidden px-4 py-4 text-muted-foreground sm:table-cell">{row.distance}</td>
                    <td className="px-4 py-4">
                      <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium", row.stockClass)}>
                        {row.stock === "In stock" && <CheckCircle2 className="size-3.5" aria-hidden />}
                        {row.stock}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-semibold tabular-nums">{row.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Prices set by pharmacies, shown in ETB. You pay at the pharmacy - no online billing.
          </p>
        </section>

        {/* How it works */}
        <section id="how" className="border-y border-border bg-card">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <SectionHeading
              eyebrow="Simple by design"
              title="Search. Compare. Go."
              body="From typing a medicine name to walking out with it - in three steps."
            />
            <div className="mx-auto mt-12 grid max-w-5xl gap-10 sm:grid-cols-3 sm:gap-8">
              {steps.map((step) => (
                <div key={step.n} className="border-t border-border pt-5">
                  <p className="text-xs font-semibold tracking-widest text-primary-strong">{step.n}</p>
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
            eyebrow="Who it's for"
            title="Built for patients and pharmacies."
            body="Two sides of the same network - one calm, connected way to find medicine."
          />
          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            <div className="flex flex-col rounded-[var(--radius)] border border-border bg-card p-8">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary-subtle text-primary-strong">
                <UserRound className="size-5" aria-hidden />
              </span>
              <h3 className="mt-5 text-xl font-semibold tracking-tight">For patients</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Find a medicine nearby, compare prices in ETB, and understand how to take
                it - all in plain language.
              </p>
              <ul className="mt-5 space-y-2.5 text-sm">
                {patientPoints.map((point) => (
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
                  Sign Up
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </div>

            <div id="pharmacies" className="flex flex-col rounded-[var(--radius)] border border-border bg-card p-8">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary-subtle text-primary-strong">
                <Store className="size-5" aria-hidden />
              </span>
              <h3 className="mt-5 text-xl font-semibold tracking-tight">For pharmacies</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                List your stock once and let nearby patients find it. Update prices and
                availability in seconds.
              </p>
              <ul className="mt-5 space-y-2.5 text-sm">
                {pharmacyPoints.map((point) => (
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
                  List your pharmacy
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-sm text-muted-foreground sm:flex-row">
          <span>&copy; {new Date().getFullYear()} PharmaLink</span>
          <span>Free for patients &middot; No online billing</span>
          <span>Amharic &amp; English</span>
        </div>
      </footer>
    </div>
  );
}