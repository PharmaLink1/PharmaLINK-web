import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-hover)]",
  secondary:
    "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-canvas)]",
  ghost: "bg-transparent text-[var(--color-brand)] hover:bg-[var(--color-brand)]/10",
};

/**
 * PharmaLink primary UI button — flat, 10px radius, brand green, locked in
 * from Page 1 (Login). Reused as-is across all future pages.
 */
export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex h-12 items-center justify-center rounded-[var(--radius-button)] px-4 text-base font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]/40 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
