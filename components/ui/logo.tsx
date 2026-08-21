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
      <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Pill className="size-5" aria-hidden />
      </span>
      <span className="text-lg">PharmaLink</span>
    </span>
  );

  if (!asLink) return inner;
  return (
    <Link href="/" aria-label="PharmaLink home" className="inline-flex">
      {inner}
    </Link>
  );
}
