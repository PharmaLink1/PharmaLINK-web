import { cn } from "@/lib/cn";

/**
 * Decorative L-shaped ticks at the four corners of a `relative` container — the
 * "edge style" used across PharmaLink's technical surfaces. Drop inside any
 * position-relative element. Defaults to the green accent; pass `className` to
 * recolor (e.g. "border-border" for a subtle version).
 */
export function CornerTicks({
  className,
  size = "size-2.5",
}: {
  className?: string;
  size?: string;
}) {
  const base = cn("pointer-events-none absolute border-primary/60", size, className);
  return (
    <>
      <span aria-hidden className={cn(base, "-left-px -top-px border-l border-t")} />
      <span aria-hidden className={cn(base, "-right-px -top-px border-r border-t")} />
      <span aria-hidden className={cn(base, "-bottom-px -left-px border-b border-l")} />
      <span aria-hidden className={cn(base, "-bottom-px -right-px border-b border-r")} />
    </>
  );
}
