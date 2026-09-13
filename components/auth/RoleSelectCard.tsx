import type { ReactNode } from "react";
import { CheckmarkIcon } from "@/components/ui/icons";

/**
 * Selectable role card (Page 2). Tapping selects it (radio behavior — one
 * role at a time); it does not navigate on its own. The parent page enables
 * Continue once a card is selected and does the actual navigation, per the
 * PRD's deliberate two-tap flow (kinder to the low-tech caregiver persona
 * than a single-tap-to-advance card).
 */
export function RoleSelectCard({
  icon,
  title,
  description,
  selected,
  onSelect,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`relative flex min-h-[64px] flex-1 flex-col items-start rounded-[16px] border p-6 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]/40 ${
        selected
          ? "border-2 border-[var(--color-brand)] bg-[var(--color-brand)]/5"
          : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-text-secondary)]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute top-6 right-6 flex h-5 w-5 items-center justify-center rounded-full border ${
          selected
            ? "border-[var(--color-brand)] bg-[var(--color-brand)] text-white"
            : "border-[var(--color-border)] bg-[var(--color-surface)]"
        }`}
      >
        {selected && <CheckmarkIcon />}
      </span>

      <span className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[var(--color-canvas)] text-[var(--color-brand)]">
        {icon}
      </span>

      <span className="mt-4 text-base font-semibold text-[var(--color-text-primary)]">{title}</span>
      <span className="mt-2 text-sm leading-[1.6] text-[var(--color-text-secondary)]">{description}</span>
    </button>
  );
}
