import { Check } from "lucide-react";
import { Logo } from "@/components/ui/logo";

const points = [
  "See which nearby pharmacies have your medicine in stock",
  "Compare prices in ETB before you travel",
  "Plain-language drug information in Amharic and English",
];

/**
 * Split-screen auth: a calm branded panel on the left (desktop) and the form on
 * the right. On mobile the panel is hidden and just the form (with a logo) shows.
 * Matches the landing page's light Mint Signal tone — faded vertical rules, a soft
 * mint glow, and primary-strong accents (no dev-tool grid or corner ticks).
 */
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-card p-12 lg:flex">
        {/* Faded vertical rules + soft mint glow — image-free, mirrors the hero. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-y-0 left-12 w-px bg-linear-to-b from-transparent via-border to-border" />
          <div className="absolute inset-y-0 right-12 w-px bg-linear-to-b from-transparent via-border/60 to-border/60" />
          <div className="absolute -left-24 top-0 size-[420px] rounded-full bg-primary/10 blur-[120px]" />
        </div>

        <div className="relative">
          <Logo />
        </div>

        <div className="relative max-w-md">
          <p className="text-sm font-medium text-primary-strong">Medicine, mapped</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-foreground">
            Find the medicines you need, at pharmacies near you.
          </h2>
          <ul className="mt-8 space-y-4">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary-strong">
                  <Check className="size-3.5" aria-hidden />
                </span>
                <span className="text-muted-foreground">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-muted-foreground">
          Connecting patients and pharmacies across Ethiopia.
        </p>
      </aside>

      <main className="flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <div className="rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm sm:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
