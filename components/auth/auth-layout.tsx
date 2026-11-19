"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { Logo } from "@/components/ui/logo";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ThemeToggle } from "@/components/motion/theme-toggle";

/**
 * Split-screen auth: the hero photograph on the left (desktop) with branded copy
 * floating over it, and the form on the right. On mobile the aside is hidden —
 * just the form with a logo shows. The left panel reuses the same tablets
 * photograph from the landing hero for visual continuity; a heavy frosted veil
 * keeps copy readable while two soft organic glows add warmth.
 */
export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-border p-12 lg:flex">
        {/* Background photo + overlays */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <Image
            src="/img/hero-tablets.jpg"
            alt=""
            fill
            sizes="50vw"
            className="object-cover object-[64%_45%] saturate-[0.9] dark:grayscale dark:brightness-110 dark:opacity-[0.55]"
          />
          {/* Frosted veil for text readability. */}
          <div className="absolute inset-0 bg-card/75 dark:bg-background/60" />
          {/* Soft organic glows — mint top-left, warm bottom-right. */}
          <div className="absolute -left-20 -top-10 size-[380px] rounded-full bg-primary/12 blur-[110px] dark:bg-primary/8" />
          <div className="absolute -bottom-16 -right-12 size-[320px] rounded-full bg-primary/8 blur-[100px] dark:bg-primary/5" />
          {/* Bottom fade into the border edge. */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-card/90 to-transparent dark:from-background/80" />
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
        {/* Top bar: home link (left) + language & theme controls (right). */}
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
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
