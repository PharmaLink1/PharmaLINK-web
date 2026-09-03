"use client";

import Link from "next/link";
import * as React from "react";
import { Menu, X } from "lucide-react";
import { useSession } from "@/lib/auth-context";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/ui/logo";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/motion/theme-toggle";
import { CornerTicks } from "@/components/ui/corner-ticks";
import { LanguageToggle } from "@/components/layout/language-toggle";

export function SiteHeader() {
  const { status } = useSession();
  const { t } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const close = () => setOpen(false);

  const navLinks = [
    { label: t.nav.howItWorks, href: "#how" },
    { label: t.nav.comparePrices, href: "#compare" },
    { label: t.nav.forPharmacies, href: "#pharmacies" },
  ];

  // Full-width and transparent at the top; on scroll it floats into a compact,
  // centered rounded pill (border + blur + shadow).
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on Escape.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const authButtons = (block: boolean) =>
    status === "authenticated" ? (
      <Link
        href="/dashboard"
        onClick={close}
        className={buttonVariants({ block, size: block ? "md" : "sm" })}
      >
        {t.nav.dashboard}
      </Link>
    ) : (
      <>
        <Link
          href="/signin"
          onClick={close}
          className={buttonVariants({ variant: block ? "outline" : "ghost", block, size: block ? "md" : "sm" })}
        >
          {t.nav.login}
        </Link>
        <Link href="/signup" onClick={close} className={buttonVariants({ block, size: block ? "md" : "sm" })}>
          {t.nav.signUp}
        </Link>
      </>
    );

  return (
    <>
      <header className="sticky top-0 z-50">
        <div
          className={cn(
            "relative mx-auto flex h-12 items-center gap-2 px-1 transition-all duration-300 ease-out",
            scrolled
              ? "max-md:bg-background/60 backdrop-blur-2xl backdrop-saturate-150 md:mt-2 md:h-12 md:max-w-3xl md:rounded-xl md:border md:border-white/60 md:bg-white/40 md:px-1 md:shadow-lg md:shadow-black/5 lg:max-w-5xl dark:md:border-white/10 dark:md:bg-white/5"
              : "max-w-6xl bg-background/30 backdrop-blur-lg backdrop-saturate-150",
          )}
        >
          <div className="flex items-center">
            <Logo />
          </div>

          {/* desktop nav */}
          <nav aria-label={t.nav.primary} className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1.5 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-4 py-1 text-sm text-foreground transition-colors hover:bg-muted focus-visible:bg-muted"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center justify-end">
            <LanguageToggle />
            <ThemeToggle
              variant="blinds"
              className="size-9 shrink-0 rounded-md text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
              iconClassName="size-4"
            />
            <div className="hidden items-center gap-2 lg:flex">{authButtons(false)}</div>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={t.nav.openMenu}
              className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-muted lg:hidden"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>

      {/* mobile menu - rendered outside the header so `fixed` centers on the viewport */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-6 lg:hidden">
          <button
            type="button"
            aria-label={t.nav.closeMenu}
            onClick={close}
            className="absolute inset-0 bg-background/60 backdrop-blur-lg"
          />
          <div className="relative my-auto w-full max-w-xs">
            <CornerTicks />
            <div className="rounded-lg border border-border bg-card p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <Logo />
                <button
                  type="button"
                  onClick={close}
                  aria-label={t.nav.closeMenu}
                  className="inline-flex size-9 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-muted"
                >
                  <X className="size-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={close}
                    className="rounded-md px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-5 flex flex-col gap-2 border-t border-border pt-5">
                {authButtons(true)}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
