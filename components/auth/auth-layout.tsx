import Link from "next/link";
import { CircleCheck, Pill } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { CornerTicks } from "@/components/ui/corner-ticks";

const points = [
  "See which nearby pharmacies have your medicine in stock",
  "Compare prices in ETB before you travel",
  "Plain-language drug information in Amharic and English",
];

/**
 * Split-screen auth: a technical branded panel on the left (desktop) and the form
 * on the right. On mobile the panel is hidden and just the form (with a logo) shows.
 */
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-card p-12 lg:flex">
        {/* technical texture + glow, scoped to the panel */}
        <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 opacity-70" />
        <div aria-hidden className="pointer-events-none absolute -left-24 top-0 h-[420px] w-[420px] rounded-full bg-primary/10 blur-[120px]" />

        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-2 font-semibold" aria-label="PharmaLink home">
            <span className="inline-flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Pill className="size-5" aria-hidden />
            </span>
            <span className="text-lg">PharmaLink</span>
          </Link>
        </div>

        <div className="relative max-w-md">
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-primary">
            Medicine, mapped
          </p>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-foreground">
            Find the medicines you need, at pharmacies near you.
          </h2>
          <ul className="mt-8 space-y-4">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <CircleCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                <span className="text-muted-foreground">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative font-mono text-xs text-muted-foreground">
          Connecting patients and pharmacies across Ethiopia.
        </p>
      </aside>

      <main className="flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <div className="relative">
            <CornerTicks />
            <div className="rounded-lg border border-border bg-card/40 p-6 sm:p-8">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
