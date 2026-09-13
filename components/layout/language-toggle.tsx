"use client";

import * as React from "react";
import { useLanguage } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/cn";

const options: { value: Locale; code: string }[] = [
  { value: "en", code: "EN" },
  { value: "am", code: "አማ" },
];

/**
 * Compact English / Amharic switch. The active language sits on the primary
 * surface; full language names are exposed to assistive tech (codes stay short
 * so the header doesn't crowd on mobile). Switching is instant and persisted.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t.language.label}
      className={cn("inline-flex items-center rounded-md border border-border bg-card p-0.5", className)}
    >
      {options.map((option) => {
        const active = locale === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            aria-label={
              option.value === "en" ? t.language.english : t.language.amharic
            }
            title={option.value === "en" ? t.language.english : t.language.amharic}
            onClick={() => setLocale(option.value)}
            className={cn(
              "inline-flex h-7 min-w-9 items-center justify-center rounded-[5px] px-2 text-xs font-semibold transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.code}
          </button>
        );
      })}
    </div>
  );
}
