"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellIcon, SearchIcon } from "@/components/ui/icons";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/i18n/useTranslation";

const TABS = [
  { key: "search", href: "/home", Icon: SearchIcon },
  { key: "reminders", href: "/reminders", Icon: BellIcon },
  { key: "profile", href: "/profile", Icon: null },
] as const;

/**
 * Mobile bottom nav for the patient app shell (Page 6 PRD §7: "bottom nav
 * on mobile"). The Figma frame only designed the desktop top nav (plain
 * text links, no icons), but §8 requires "icon + text label" for
 * accessibility, so the icons here are this component's own addition, not
 * pixel-copied from an asset that doesn't exist. Hidden at `md` and above.
 */
export function PatientBottomNav() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const pathname = usePathname();

  const labels: Record<(typeof TABS)[number]["key"], string> = {
    search: t.nav.search,
    reminders: t.nav.reminders,
    profile: t.nav.profile,
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-[var(--color-border)] bg-[var(--color-surface)] md:hidden">
      {TABS.map(({ key, href, Icon }) => {
        const isActive = pathname === href || (key === "search" && pathname.startsWith("/search"));
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
              isActive ? "text-[var(--color-brand)]" : "text-[var(--color-text-secondary)]"
            }`}
          >
            {Icon ? <Icon /> : <UserAvatar name={user?.name} avatarUrl={user?.avatarUrl} size={20} />}
            {labels[key]}
          </Link>
        );
      })}
    </nav>
  );
}
