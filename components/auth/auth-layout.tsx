"use client";

import { Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { Logo } from "@/components/ui/logo";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ThemeToggle } from "@/components/motion/theme-toggle";

/**
 * Split-screen auth: a calm branded panel on the left (desktop) and the form on
 * the right. On mobile the panel is hidden and just the form (with a logo) shows.
 * Matches the landing page's light Mint Signal tone — faded vertical rules, a soft
 * mint glow, and primary-strong accents (no dev-tool grid or corner ticks).
 */
export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();

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
          <p className="text-sm font-medium text-primary-strong">{t.auth.medicineMapped}</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-foreground">
            {t.auth.headline}
          </h2>
          <ul className="mt-8 space-y-4">
            {t.auth.points.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary-strong">
                  <Check className="size-3.5" aria-hidden />
                </span>
                <span className="text-muted-foreground">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-muted-foreground">{t.auth.footer}</p>
      </aside>

      <main className="relative flex flex-col px-6 py-6">
        {/* Top bar: home link (left) + language & theme controls (right). The logo
            is hidden on desktop where the aside already shows it. */}
        <div className="flex items-center justify-between">
          <div className="lg:invisible">
            <Logo />
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle
              variant="blinds"
              className="size-9 shrink-0 rounded-md text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
              iconClassName="size-4"
            />
            <LanguageToggle />
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center py-6">
          <div className="w-full max-w-sm">
            <div className="rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm sm:p-8">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
