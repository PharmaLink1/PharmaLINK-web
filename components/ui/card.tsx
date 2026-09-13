import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

export const cardVariants = cva("text-card-foreground", {
  variants: {
    variant: {
      // Standard content surface — dashboards, admin, lists. Dense and calm.
      default: "rounded-lg border border-border bg-card shadow-sm",
      // Focal card (auth, settings): shares the nav modal's shape language —
      // rounded-2xl, refined border, mint top hairline — but keeps a solid
      // surface and a gentle shadow so it reads clean, not heavy.
      elevated:
        "relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-md dark:border-white/10",
      // Overlay dialog (mobile nav): the full modal treatment — glass surface
      // and a strong, mint-tinted shadow.
      modal:
        "relative overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-2xl shadow-primary/5 backdrop-blur-2xl dark:border-white/10 dark:shadow-black/60",
    },
  },
  defaultVariants: { variant: "default" },
});

type CardProps = React.ComponentProps<"div"> &
  VariantProps<typeof cardVariants> & {
    /** Mint top-edge highlight. On by default for elevated/modal; pass false to opt out. */
    hairline?: boolean;
  };

export function Card({ className, variant, hairline, children, ...props }: CardProps) {
  const showHairline = hairline ?? (variant === "elevated" || variant === "modal");
  return (
    <div className={cn(cardVariants({ variant }), className)} {...props}>
      {showHairline && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent"
        />
      )}
      {children}
    </div>
  );
}

export function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1 p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn("text-xl font-semibold tracking-tight", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex items-center p-6 pt-0", className)} {...props} />;
}
