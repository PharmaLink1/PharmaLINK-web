"use client";

import Link from "next/link";
import * as React from "react";
import { Menu, X } from "lucide-react";
import { useSession } from "@/lib/auth-context";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/ui/logo";
import { buttonVariants } from "@/components/ui/button";
import { CornerTicks } from "@/components/ui/corner-ticks";

const navLinks = [
  { label: "Find medicines", href: "/signup" },
  { label: "Drug info", href: "/signup" },
  { label: "Reminders", href: "/signup" },
  { label: "For pharmacies", href: "#pharmacies" },
];

export function SiteHeader() {
  const { status } = useSession();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const close = () => setOpen(false);

  // Sliding highlight (lozenge) that follows the hovered/focused desktop nav link.
  const navRef = React.useRef<HTMLElement>(null);
  const [indicator, setIndicator] = React.useState({ left: 0, width: 0, opacity: 0 });
  const moveIndicator = (el: HTMLElement) => {
    const nav = navRef.current;
    if (!nav) return;
    const r = el.getBoundingClientRect();
    const base = nav.getBoundingClientRect();
    setIndicator({ left: r.left - base.left, width: r.width, opacity: 1 });
  };
  const hideIndicator = () => setIndicator((s) => ({ ...s, opacity: 0 }));

  // Transparent at the top of the page; gains strength as the user scrolls.
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    const id = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("scroll", onScroll);
    };
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
    // Desktop auth sits beside the nav islands at matching height; both use the
    // app's default sharp radius. The mobile menu keeps full-width block buttons.
    status === "authenticated" ? (
      <Link href="/dashboard" onClick={close} className={buttonVariants({ block, size: block ? "md" : "sm" })}>
        Dashboard
      </Link>
    ) : (
      <>
        <Link
          href="/signin"
          onClick={close}
          className={buttonVariants({ variant: block ? "outline" : "ghost", block, size: "md" })}
        >
          Sign in
        </Link>
        <Link href="/signup" onClick={close} className={buttonVariants({ block, size: "md" })}>
          Create account
        </Link>
      </>
    );

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 transition-colors duration-200",
          scrolled && "bg-background/40 backdrop-blur-lg",
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-6 pt-3 md:pt-4">
          <div className="flex flex-1 items-center">
            <Logo />
          </div>

          {/* centered nav (desktop) — frosted rounded-full pill with a sliding lozenge */}
          <nav
            ref={navRef}
            aria-label="Primary"
            onMouseLeave={hideIndicator}
            className={cn(
              "relative hidden items-center rounded-lg border p-1.5 backdrop-blur-md transition-colors lg:flex",
              scrolled ? "border-border bg-card/80" : "border-border/70 bg-card/50",
            )}
          >
            <span
              aria-hidden
              style={{ left: indicator.left, width: indicator.width, opacity: indicator.opacity }}
              className="pointer-events-none absolute inset-y-1.5 rounded-sm bg-muted transition-all duration-200 ease-out"
            />
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onMouseEnter={(e) => moveIndicator(e.currentTarget)}
                onFocus={(e) => moveIndicator(e.currentTarget)}
                className="relative z-10 rounded-sm px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-1 items-center justify-end gap-2">
            <div className="hidden items-center gap-2 lg:flex">{authButtons(false)}</div>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-lg border text-foreground backdrop-blur-md transition-colors hover:bg-muted lg:hidden",
                scrolled ? "border-border bg-card/80" : "border-border/70 bg-card/50",
              )}
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>

      {/* mobile menu — rendered OUTSIDE the blurred header so `fixed` uses the
          viewport as its containing block and truly centers on both axes. */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-6 lg:hidden">
          {/* blurred backdrop (the page behind) — tap to close */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="absolute inset-0 bg-background/50 backdrop-blur-lg"
          />

          {/* the menu itself: opaque, bordered, corner-ticked */}
          <div className="relative my-auto w-full max-w-xs">
            <CornerTicks />
            <div className="rounded-lg border border-border bg-card p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <Logo />
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close menu"
                  className="inline-flex size-9 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-muted"
                >
                  <X className="size-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={close}
                    className="rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
