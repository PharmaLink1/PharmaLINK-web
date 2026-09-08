"use client";

import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { createPortal } from "react-dom";
import {
  Boxes,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Pill,
  Settings,
  Store,
  User,
  UserPlus,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useSession } from "@/lib/auth-context";
import { useLanguage } from "@/lib/i18n";
import type { Role } from "@/lib/auth-types";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/ui/logo";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ThemeToggle } from "@/components/motion/theme-toggle";
import { SPRING_PANEL } from "@/lib/ease";

const emptySubscribe = () => () => {};

function useMounted() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

/** Authenticated app header with a language switch and user menu (name + role + logout).
 * Desktop shows inline admin/pharmacist links plus an avatar dropdown; on mobile everything
 * collapses into a centered modal card opened from the hamburger. */
export function AppHeader() {
  const { user, logout } = useSession();
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const mounted = useMounted();
  const [open, setOpen] = React.useState(false); // desktop avatar dropdown
  const [menuOpen, setMenuOpen] = React.useState(false); // mobile full-screen drawer
  const menuRef = React.useRef<HTMLDivElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const name = user ? [user.firstName, user.lastName].filter(Boolean).join(" ") : "";

  const roleLabels: Record<Role, string> = {
    user: t.nav.roles.user,
    pharmacist: t.nav.roles.pharmacist,
    admin: t.nav.roles.admin,
  };

  // Role-aware navigation, shared between desktop bar and mobile drawer.
  const roleNavLinks = React.useMemo(() => {
    if (user?.role === "admin") {
      return [
        { href: "/admin/pharmacist-applications", label: t.nav.applications, icon: ClipboardList },
        { href: "/admin/pharmacies", label: t.nav.adminPharmacies, icon: Store },
        { href: "/admin/admins", label: t.nav.adminAdmins, icon: UserPlus },
      ];
    }
    if (user?.role === "pharmacist") {
      return [
        { href: "/dashboard/pharmacy", label: t.meta.pharmacy, icon: Store },
        { href: "/dashboard/inventory", label: t.meta.inventory, icon: Boxes },
        { href: "/dashboard/medicines", label: t.meta.medicines, icon: Pill },
      ];
    }
    return [];
  }, [user?.role, t]);

  // Desktop dropdown: close on outside click / Escape.
  React.useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Mobile drawer: lock body scroll, close on Escape, focus the close button.
  React.useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  async function handleLogout() {
    setOpen(false);
    setMenuOpen(false);
    await logout();
    router.replace("/");
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-card/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Desktop: inline role links + avatar dropdown */}
          <div className="hidden items-center gap-1 lg:flex sm:gap-2">
            {roleNavLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <link.icon className="size-4 text-muted-foreground" aria-hidden />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Toggles live in the bar on all screen sizes (desktop + mobile) */}
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle
              variant="blinds"
              className="size-9 shrink-0 rounded-md text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
              iconClassName="size-4"
            />
            <LanguageToggle />
          </div>

          {/* Desktop avatar dropdown */}
          <div ref={menuRef} className="relative hidden lg:block">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={open}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-primary-subtle text-primary-strong">
                <User className="size-4" aria-hidden />
              </span>
              <span className="hidden text-left sm:block">
                <span className="block max-w-48 truncate font-medium leading-tight">
                  {name || t.nav.account}
                </span>
                {user && (
                  <span className="block text-xs leading-tight text-muted-foreground">
                    {roleLabels[user.role] ?? user.role}
                  </span>
                )}
              </span>
              <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
            </button>

            {open && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 overflow-hidden rounded-md border border-border bg-card shadow-md"
              >
                <div className="border-b border-border px-3 py-2.5">
                  <p className="truncate text-sm font-medium">{name || t.nav.account}</p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <Link
                  href="/settings/security"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted"
                >
                  <Settings className="size-4 text-muted-foreground" aria-hidden />
                  {t.nav.changePassword}
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted"
                >
                  <LogOut className="size-4 text-muted-foreground" aria-hidden />
                  {t.nav.logOut}
                </button>
              </div>
            )}
          </div>

          {/* Mobile: hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={t.nav.openMenu}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
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
            {menuOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-6 lg:hidden">
                <motion.button
                  type="button"
                  aria-label={t.nav.closeMenu}
                  onClick={closeMenu}
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
                  <Card
                    variant="modal"
                    role="dialog"
                    aria-modal="true"
                    className="p-6"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <Logo />
                      <button
                        ref={closeButtonRef}
                        type="button"
                        onClick={closeMenu}
                        aria-label={t.nav.closeMenu}
                        className="inline-flex size-9 items-center justify-center rounded-full border border-border/70 text-foreground transition-all hover:bg-muted active:scale-95"
                      >
                        <X className="size-4" aria-hidden />
                      </button>
                    </div>

                    <nav className="flex flex-col gap-1">
                      <Link
                        href="/dashboard"
                        onClick={closeMenu}
                        className={cn(
                          "group flex min-h-11 items-center justify-between rounded-lg py-2.5 text-sm transition-all active:scale-[0.99]",
                          pathname === "/dashboard"
                            ? "border-l-2 border-primary bg-primary-subtle pl-3 pr-3.5 font-medium text-primary-strong shadow-xs shadow-primary/10"
                            : "pl-3 pr-3.5 text-muted-foreground hover:bg-muted/80 hover:text-foreground active:bg-muted",
                        )}
                      >
                        <span className="flex items-center gap-2.5">
                          <LayoutDashboard
                            className={cn(
                              "size-4 shrink-0",
                              pathname === "/dashboard" ? "text-primary-strong" : "text-muted-foreground",
                            )}
                            aria-hidden
                          />
                          <span className="truncate">{t.nav.dashboard}</span>
                        </span>
                        <ChevronRight
                          className={cn(
                            "size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5",
                            pathname === "/dashboard" ? "text-primary-strong/80" : "text-muted-foreground/50",
                          )}
                        />
                      </Link>

                      {roleNavLinks.map((link) => {
                        const active = pathname === link.href;
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={closeMenu}
                            className={cn(
                              "group flex min-h-11 items-center justify-between rounded-lg py-2.5 text-sm transition-all active:scale-[0.99]",
                              active
                                ? "border-l-2 border-primary bg-primary-subtle pl-3 pr-3.5 font-medium text-primary-strong shadow-xs shadow-primary/10"
                                : "pl-3 pr-3.5 text-muted-foreground hover:bg-muted/80 hover:text-foreground active:bg-muted",
                            )}
                          >
                            <span className="flex items-center gap-2.5">
                              <link.icon
                                className={cn(
                                  "size-4 shrink-0",
                                  active ? "text-primary-strong" : "text-muted-foreground",
                                )}
                                aria-hidden
                              />
                              <span className="truncate">{link.label}</span>
                            </span>
                            <ChevronRight
                              className={cn(
                                "size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5",
                                active ? "text-primary-strong/80" : "text-muted-foreground/50",
                              )}
                            />
                          </Link>
                        );
                      })}
                    </nav>

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
                          href="/settings/security"
                          onClick={closeMenu}
                          className={cn(
                            buttonVariants({ variant: "outline", block: true }),
                            "min-h-11 justify-start",
                          )}
                        >
                          <Settings className="size-4 text-muted-foreground" aria-hidden />
                          {t.nav.changePassword}
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
                  </Card>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
