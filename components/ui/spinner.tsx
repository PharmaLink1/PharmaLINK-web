import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";

/** Compact loading indicator with an accessible label. */
export function Spinner({
  className,
  label = "Loading",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span role="status" aria-label={label}>
      <LoaderCircle className={cn("size-5 animate-spin text-muted-foreground", className)} aria-hidden />
    </span>
  );
}
