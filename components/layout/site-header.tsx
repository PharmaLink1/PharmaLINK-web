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
  Search,
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

const EASE_BASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const emptySubscribe = () => () => {};

function useMounted() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

const menuList = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const menuItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_BASE } },
};

export function SiteHeader() {
  const { user, status, logout } = useSession();
  const { t } = useLanguage();
  const router = useRouter();
  const mounted = useMounted();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const sheetRef = React.useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);

  const name = user ? [user.firstName, user.lastName].filter(Boolean).join(" ") : "";

  const roleLabels: Record<Role, string> = {
    user: t.nav.roles.user,
    pharmacist: t.nav.roles.pharmacist,
    admin: t.nav.roles.admin,
  };

  const navLinks = [
    { label: t.nav.howItWorks, href: "#how", icon: HelpCircle },
    { label: t.nav.comparePrices, href: "/dashboard", icon: ArrowUpDown },
    { label: t.nav.forPharmacies, href: "#pharmacies", icon: Store },
  ];

  // Track scroll so the bar can frost once the hero starts moving under it.
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
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      // Keep focus inside the sheet while it is open.
      const nodes = sheetRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!nodes?.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
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
          className={buttonVariants({
            variant: block ? "outline" : "ghost",
            block,
            size: block ? "md" : "sm",
          })}
        >
          {t.nav.login}
        </Link>
        <Link
          href="/signup"
          onClick={close}
          className={buttonVariants({ block, size: block ? "md" : "sm" })}
        >
          {t.nav.signUp}
        </Link>
      </>
    );

  return (
    <>
      <header
        style={{ pointerEvents: "none" }}
        className="fixed inset-x-0 top-0 z-50 pointer-events-none px-4 pt-3 sm:px-6 sm:pt-2"
      >
        <div
          style={{ pointerEvents: "auto" }}
          className={cn(
            "pointer-events-auto mx-auto flex h-14 w-full max-w-6xl items-center gap-2 rounded-md border px-3 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-4",
            // At the top over the hero the bar is completely transparent;
            // frosted glass blur and a subtle border settle in on scroll.
            scrolled
              ? "border-border/60 bg-background/65 shadow-lg shadow-black/5 backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 dark:bg-background/60"
              : "border-transparent bg-transparent shadow-none",
          )}
        >
          <div className="flex items-center">
            {/* Below 380px the wordmark would crowd the three header controls. */}
            <Logo className="max-[379px]:[&>span:last-child]:hidden" />
          </div>

          {/* desktop nav */}
          <nav
            aria-label={t.nav.primary}
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-foreground/5 hover:text-foreground focus-visible:bg-foreground/5 focus-visible:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center justify-end gap-1.5">
            <ThemeToggle
              variant="blinds"
              className="inline-flex size-10 shrink-0 rounded-md text-muted-foreground transition-colors duration-300 hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 sm:size-9"
              iconClassName="size-5 sm:size-4"
            />
            <LanguageToggle />
            <div className="hidden items-center gap-2 lg:flex">{authButtons(false)}</div>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={t.nav.openMenu}
              aria-haspopup="dialog"
              aria-expanded={open}
              className="ml-0.5 inline-flex size-10 items-center justify-center rounded-md border border-border/70 bg-card/70 text-foreground backdrop-blur-sm transition-colors duration-300 hover:bg-muted active:scale-95 lg:hidden"
            >
              <Menu className="size-5" aria-hidden />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu: a full-height sheet with links arriving in reading order. */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <motion.button
                  type="button"
                  aria-label={t.nav.closeMenu}
                  onClick={close}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE_BASE }}
                  className="absolute inset-0 bg-background/70 backdrop-blur-xl"
                />
                <motion.div
                  ref={sheetRef}
                  role="dialog"
                  aria-modal="true"
                  aria-label={t.nav.openMenu}
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ duration: 0.5, ease: EASE_BASE }}
                  className="relative ml-auto flex h-full w-full flex-col overflow-y-auto overscroll-contain bg-background/95 px-6 pb-8 pt-5 shadow-2xl backdrop-blur-2xl sm:max-w-sm sm:border-l sm:border-border/70"
                >
                  <div className="flex items-center justify-between">
                    <Logo />
                    <button
                      ref={closeButtonRef}
                      type="button"
                      onClick={close}
                      aria-label={t.nav.closeMenu}
                      className="inline-flex size-10 items-center justify-center rounded-md border border-border/70 text-foreground transition-colors duration-300 hover:bg-muted active:scale-95"
                    >
                      <X className="size-4" aria-hidden />
                    </button>
                  </div>

                  <motion.nav
                    aria-label={t.nav.primary}
                    variants={menuList}
                    initial="hidden"
                    animate="show"
                    className="mt-10 flex flex-col gap-0.5"
                  >
                    <motion.div variants={menuItem}>
                      <Link
                        href="#search"
                        onClick={close}
                        className="group flex min-h-14 items-center gap-3 rounded-md px-3 text-lg font-medium text-foreground transition-colors duration-300 hover:bg-foreground/5"
                      >
                        <Search className="size-5 shrink-0 text-primary-strong" aria-hidden />
                        <span className="truncate">{t.hero.findMedicine}</span>
                        <ChevronRight className="ml-auto size-4 shrink-0 text-muted-foreground/60" aria-hidden />
                      </Link>
                    </motion.div>

                    {navLinks.map((link) => (
                      <motion.div key={link.href} variants={menuItem}>
                        <Link
                          href={link.href}
                          onClick={close}
                          className="group flex min-h-14 items-center gap-3 rounded-md px-3 text-lg font-medium text-muted-foreground transition-colors duration-300 hover:bg-foreground/5 hover:text-foreground"
                        >
                          <link.icon className="size-5 shrink-0" aria-hidden />
                          <span className="truncate">{link.label}</span>
                          <ChevronRight className="ml-auto size-4 shrink-0 text-muted-foreground/60" aria-hidden />
                        </Link>
                      </motion.div>
                    ))}

                    {status === "authenticated" && (
                      <motion.div variants={menuItem}>
                        <Link
                          href="/dashboard"
                          onClick={close}
                          className="group flex min-h-14 items-center gap-3 rounded-md px-3 text-lg font-medium text-primary-strong transition-colors duration-300 hover:bg-primary-subtle"
                        >
                          <LayoutDashboard className="size-5 shrink-0" aria-hidden />
                          <span className="truncate">{t.nav.dashboard}</span>
                          <ChevronRight className="ml-auto size-4 shrink-0 opacity-60" aria-hidden />
                        </Link>
                      </motion.div>
                    )}
                  </motion.nav>

                  <div className="mt-auto">
                    <p className="pb-5 text-xs text-muted-foreground">{t.home.footerTrust}</p>
                    <div className="border-t border-border/70 pt-6">
                    {status === "authenticated" ? (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary-strong">
                            <User className="size-5" aria-hidden />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{name || t.nav.account}</p>
                            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                            {user?.role && (
                              <p className="mt-0.5 text-xs font-medium text-primary-strong">
                                {roleLabels[user.role] ?? user.role}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className={cn(
                            buttonVariants({ variant: "outline", block: true }),
                            "justify-start",
                          )}
                        >
                          <LogOut className="size-4 text-muted-foreground" aria-hidden />
                          {t.nav.logOut}
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2.5">
                        <Link
                          href="/signin"
                          onClick={close}
                          className={cn(buttonVariants({ variant: "outline", block: true }), "justify-start")}
                        >
                          <LogIn className="size-4 text-muted-foreground" aria-hidden />
                          {t.nav.login}
                        </Link>
                        <Link
                          href="/signup"
                          onClick={close}
                          className={cn(buttonVariants({ block: true }), "justify-start")}
                        >
                          <UserPlus className="size-4" aria-hidden />
                          {t.nav.signUp}
                        </Link>
                      </div>
                    )}
                    </div>
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
