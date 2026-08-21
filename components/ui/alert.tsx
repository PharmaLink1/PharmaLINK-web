import * as React from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

const styles = {
  info: { box: "border-info/30 bg-info-subtle text-info", Icon: Info },
  success: { box: "border-success/30 bg-success-subtle text-success", Icon: CircleCheck },
  warning: { box: "border-warning/30 bg-warning-subtle text-warning", Icon: TriangleAlert },
  danger: { box: "border-danger/30 bg-danger-subtle text-danger", Icon: CircleAlert },
} as const;

type AlertProps = {
  variant?: keyof typeof styles;
  className?: string;
  children: React.ReactNode;
};

/** Inline status message. Always carries an icon + text (never color alone). */
export function Alert({ variant = "info", className, children }: AlertProps) {
  const { box, Icon } = styles[variant];
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2.5 rounded-md border px-3.5 py-3 text-sm",
        box,
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span className="text-foreground/90">{children}</span>
    </div>
  );
}
