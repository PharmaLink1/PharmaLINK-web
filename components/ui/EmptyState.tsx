import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-[var(--color-border)] p-8 text-center">
      <p className="text-sm font-medium text-[var(--color-text-primary)]">{title}</p>
      {description && <p className="text-sm text-[var(--color-text-secondary)]">{description}</p>}
      {action}
    </div>
  );
}
