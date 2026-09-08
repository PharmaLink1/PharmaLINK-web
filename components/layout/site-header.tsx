"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { createPortal } from "react-dom";
import {
  ArrowUpDown,
  ChevronRight,
  HelpCircle,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Store,
  User,
  UserPlus,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useSession } from "@/lib/auth-context";
import { useLanguage } from "@/lib/i18n";
import type { Role } from "@/lib/auth-types";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/ui/logo";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/motion/theme-toggle";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { SPRING_PANEL } from "@/lib/ease";

const emptySubscribe = () => () => {};

function useMounted() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export function SiteHeader() {
  const { user, status, logout } = useSession();
  const { t } = useLanguage();
  const router = useRouter();
  const mounted = useMounted();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const close = () => setOpen(false);

  const name = user ? [user.firstName, user.lastName].filter(Boolean).join(" ") : "";

  const roleLabels: Record<Role, string> = {
    user: t.nav.roles.user,
    pharmacist: t.nav.roles.pharmacist,
    admin: t.nav.roles.admin,
  };

  const navLinks = [
    { label: t.nav.howItWorks, href: "#how", icon: HelpCircle },
    { label: t.nav.comparePrices, href: "#compare", icon: ArrowUpDown },
    { label: t.nav.forPharmacies, href: "#pharmacies", icon: Store },
  ];

  // Full-width and transparent at the top; on scroll it floats into a compact,
  // centered rounded pill (border + blur + shadow).
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll and close mobile menu on Escape.
  React.useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function handleLogout() {
    close();
    await logout();
    router.replace("/");
  }

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

          <div className="ml-auto flex items-center justify-end gap-2">
            <ThemeToggle
              variant="blinds"
              className="size-9 shrink-0 rounded-md text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
              iconClassName="size-4"
            />
            <LanguageToggle />
            <div className="hidden items-center gap-2 lg:flex">{authButtons(false)}</div>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={t.nav.openMenu}
              aria-haspopup="menu"
              aria-expanded={open}
              className="ml-2 inline-flex size-9 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-muted sm:ml-2.5 lg:hidden"
            >
              <Menu className="size-5" aria-hidden />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu — animated centered card portaled to body to escape backdrop-blur stacking context */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-6 lg:hidden">
                <motion.button
                  type="button"
                  aria-label={t.nav.closeMenu}
                  onClick={close}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-background/60 backdrop-blur-xl"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={SPRING_PANEL}
                  className="relative my-auto w-full max-w-xs"
                >
                  <div
                    role="dialog"
                    aria-modal="true"
                    className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/95 p-6 shadow-2xl shadow-primary/5 backdrop-blur-2xl dark:border-white/10 dark:shadow-black/60"
                  >
                    {/* Subtle top hairline highlight in Mint Signal accent */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent"
                    />

                    <div className="mb-5 flex items-center justify-between">
                      <Logo />
                      <button
                        ref={closeButtonRef}
                        type="button"
                        onClick={close}
                        aria-label={t.nav.closeMenu}
                        className="inline-flex size-9 items-center justify-center rounded-full border border-border/70 text-foreground transition-all hover:bg-muted active:scale-95"
                      >
                        <X className="size-4" aria-hidden />
                      </button>
                    </div>

                    <nav className="flex flex-col gap-1">
                      {status === "authenticated" && (
                        <Link
                          href="/dashboard"
                          onClick={close}
                          className="group flex min-h-11 items-center justify-between rounded-lg border-l-2 border-primary bg-primary-subtle py-2.5 pl-3 pr-3.5 text-sm font-medium text-primary-strong shadow-xs shadow-primary/10 transition-all active:scale-[0.99]"
                        >
                          <span className="flex items-center gap-2.5">
                            <LayoutDashboard className="size-4 shrink-0 text-primary-strong" aria-hidden />
                            <span className="truncate">{t.nav.dashboard}</span>
                          </span>
                          <ChevronRight className="size-4 shrink-0 text-primary-strong/80 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </Link>
                      )}

                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={close}
                          className="group flex min-h-11 items-center justify-between rounded-lg py-2.5 pl-3 pr-3.5 text-sm text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground active:bg-muted active:scale-[0.99]"
                        >
                          <span className="flex items-center gap-2.5">
                            <link.icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                            <span className="truncate font-medium">{link.label}</span>
                          </span>
                          <ChevronRight className="size-4 shrink-0 text-muted-foreground/50 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground" />
                        </Link>
                      ))}
                    </nav>

                    {status === "authenticated" ? (
                      <div className="mt-5 border-t border-border/70 pt-5">
                        <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5">
                          <div className="flex items-center gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary-strong ring-2 ring-primary/20">
                              <User className="size-5" aria-hidden />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold leading-tight text-foreground">
                                {name || t.nav.account}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                              {user?.role && (
                                <span className="mt-1 inline-flex items-center rounded-full border border-primary/25 bg-primary-subtle px-2 py-0.5 text-[10px] font-medium text-primary-strong uppercase tracking-wider">
                                  {roleLabels[user.role] ?? user.role}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3.5 flex flex-col gap-2">
                          <Link
                            href="/dashboard"
                            onClick={close}
                            className={cn(buttonVariants({ block: true }), "min-h-11 justify-start font-medium")}
                          >
                            <LayoutDashboard className="size-4" aria-hidden />
                            {t.nav.dashboard}
                          </Link>
                          <button
                            type="button"
                            onClick={handleLogout}
                            className={cn(
                              buttonVariants({ variant: "ghost", block: true }),
                              "min-h-11 justify-start text-muted-foreground hover:text-foreground",
                            )}
                          >
                            <LogOut className="size-4 text-muted-foreground" aria-hidden />
                            {t.nav.logOut}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-5 flex flex-col gap-2.5 border-t border-border/70 pt-5">
                        <Link
                          href="/signin"
                          onClick={close}
                          className={cn(buttonVariants({ variant: "outline", block: true }), "min-h-11 justify-start")}
                        >
                          <LogIn className="size-4 text-muted-foreground" aria-hidden />
                          {t.nav.login}
                        </Link>
                        <Link
                          href="/signup"
                          onClick={close}
                          className={cn(buttonVariants({ block: true }), "min-h-11 justify-start font-medium")}
                        >
                          <UserPlus className="size-4" aria-hidden />
                          {t.nav.signUp}
                        </Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
