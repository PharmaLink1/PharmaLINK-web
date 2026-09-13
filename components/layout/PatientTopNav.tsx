"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguagePill } from "@/components/ui/LanguagePill";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/i18n/useTranslation";

const TABS = [
  { key: "search", href: "/home" },
  { key: "reminders", href: "/reminders" },
  { key: "profile", href: "/profile" },
] as const;

/**
 * Desktop top nav for the patient app shell — extracted from Page 6, node
 * 6:355 ("Header - TopNavBar"): logo, Search/Reminders/Profile tabs (active
 * underlined), language pill, and a profile avatar. Hidden below `md`,
 * where PatientBottomNav takes over per the PRD's "bottom nav on mobile,
 * top nav on desktop" rule. The theme toggle isn't in this Figma frame (it
 * predates that feature) but is included for the same reason every other
 * page has it — available everywhere, not just where a screenshot showed it.
 */
export function PatientTopNav() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const pathname = usePathname();

  const labels: Record<(typeof TABS)[number]["key"], string> = {
    search: t.nav.search,
    reminders: t.nav.reminders,
    profile: t.nav.profile,
  };

  return (
    <header className="sticky top-0 z-10 hidden border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] md:block">
      <div className="mx-auto grid h-16 w-full max-w-[1280px] grid-cols-3 items-center px-6">
        <Link href="/home" className="w-fit text-2xl font-bold text-[var(--color-brand)]">
          {t.common.appName}
        </Link>

        <nav className="flex items-center justify-center gap-6 justify-self-center">
          {TABS.map((tab) => {
            // Search Results (/search) is conceptually part of the Search
            // tab, so it stays highlighted there too (Page 7 PRD §7: "Nav:
            // Search (active)... same shell as Page 6").
            const isActive =
              pathname === tab.href || (tab.key === "search" && pathname.startsWith("/search"));
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`pb-1.5 text-base transition-colors ${
                  isActive
                    ? "border-b-2 border-[var(--color-brand)] font-medium text-[var(--color-brand)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                {labels[tab.key]}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-end gap-3">
          <ThemeToggle />
          <LanguagePill />
          <Link href="/profile" aria-label={t.nav.profile}>
            <UserAvatar name={user?.name} avatarUrl={user?.avatarUrl} size={32} />
          </Link>
        </div>
      </div>
    </header>
  );
}
