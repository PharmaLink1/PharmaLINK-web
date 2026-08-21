import Link from "next/link";
import { Pill } from "lucide-react";
import { cn } from "@/lib/cn";

/** PharmaLink wordmark. Links home unless `asLink={false}`. */
export function Logo({
  className,
  asLink = true,
}: {
  className?: string;
  asLink?: boolean;
}) {
  const inner = (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="inline-flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground sm:size-8">
        <Pill className="size-4 sm:size-5" aria-hidden />
      </span>
      <span className="text-base sm:text-lg">PharmaLink</span>
    </span>
  );

  if (!asLink) return inner;
  return (
    <Link href="/" aria-label="PharmaLink home" className="inline-flex">
      {inner}
    </Link>
  );
}
