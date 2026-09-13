"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguagePill } from "@/components/ui/LanguagePill";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { PlusIcon } from "@/components/ui/icons";
import { useTranslation } from "@/lib/i18n/useTranslation";

/**
 * Shared header for every public page — the landing page, search results,
 * and (later) pharmacy/medicine detail, plus any future public page like
 * About/Privacy/Terms. No exact Figma node was provided for this section —
 * built from the reference screenshot using the same tokens/components as
 * the rest of the app (LanguagePill, ThemeToggle) so it stays visually
 * consistent and dark-mode-ready.
 *
 * The "How it works" / "For pharmacies" links are anchors into sections
 * that only exist on the landing page itself, so they're hidden on every
 * other route rather than rendered as dead links.
 */
export function PublicHeader() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  return (
    <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 px-[24px] py-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[var(--color-brand)]">
            <PlusIcon />
          </span>
          <span className="text-xl font-bold text-[var(--color-brand)]">{t.common.appName}</span>
        </Link>

        {isLandingPage && (
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#how-it-works" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
              {t.landing.navHowItWorks}
            </a>
            <a href="#for-pharmacies" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
              {t.landing.navForPharmacies}
            </a>
          </nav>
        )}

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <LanguagePill />
          <Link
            href="/login"
            className="hidden text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] sm:inline"
          >
            {t.landing.navLogIn}
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-9 items-center justify-center rounded-[var(--radius-button)] bg-[var(--color-brand)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-brand-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]/40"
          >
            {t.landing.navSignUp}
          </Link>
        </div>
      </div>
    </header>
  );
}
