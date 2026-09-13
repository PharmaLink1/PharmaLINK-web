import type { ReactNode } from "react";

type CalloutVariant = "warning" | "error";

const variantClasses: Record<CalloutVariant, { border: string; bg: string; title: string; text: string }> = {
  // Calm amber warning — used for drug-info warnings/interactions (Page 9)
  // and the pharmacy pending-review message. Deliberately not red: medical
  // warnings shouldn't read as errors. Reuses the same amber tokens as the
  // "Low stock" badge (--color-stock-low*) rather than raw Tailwind
  // amber-* literals, so this stays legible under dark mode too.
  warning: {
    border: "border-[var(--color-stock-low-border)]",
    bg: "bg-[var(--color-stock-low-bg)]",
    title: "text-[var(--color-stock-low)]",
    text: "text-[var(--color-stock-low)]",
  },
  // Form/auth errors (Page 1 Login) — calm styling using the error tokens,
  // not an alarming saturated red.
  error: {
    border: "border-[var(--color-error)]/30",
    bg: "bg-[var(--color-error-bg)]",
    title: "text-[var(--color-error)]",
    text: "text-[var(--color-error)]",
  },
};

export function Callout({
  title,
  children,
  variant = "warning",
}: {
  title?: string;
  children: ReactNode;
  variant?: CalloutVariant;
}) {
  const classes = variantClasses[variant];
  return (
    <div role={variant === "error" ? "alert" : undefined} className={`rounded-lg border p-4 ${classes.border} ${classes.bg}`}>
      {title && <p className={`mb-1 text-sm font-semibold ${classes.title}`}>{title}</p>}
      <div className={`text-sm ${classes.text}`}>{children}</div>
    </div>
  );
}
