import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Shows the role already chosen on Page 2 (never re-asked here), with a
 * "Change" link back to Role Selection. Reused by Page 4's Pharmacy Staff
 * registration with a different icon/label.
 */
export function RoleChip({
  icon,
  label,
  changeLabel,
}: {
  icon: ReactNode;
  label: string;
  changeLabel: string;
}) {
  return (
    <div className="flex w-full items-center justify-between rounded-[12px] border border-[var(--color-border)] bg-[var(--color-canvas)] p-[13px]">
      <span className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-primary)]">
        {icon}
        {label}
      </span>
      <Link
        href="/signup"
        className="rounded px-3 py-1 text-[15px] font-medium text-[var(--color-brand)] hover:underline"
      >
        {changeLabel}
      </Link>
    </div>
  );
}
