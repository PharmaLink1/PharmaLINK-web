"use client";

import { useTheme } from "@/hooks/useTheme";
import { MoonIcon, SunIcon } from "@/components/ui/icons";

/**
 * Both icons are always rendered, and CSS (keyed off the `data-theme`
 * attribute set before hydration — see globals.css) decides which one is
 * visible. This keeps the server and client markup identical, so there's no
 * hydration mismatch, while still showing the right icon on first paint.
 */
export function ThemeToggle() {
  const { toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-canvas)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]/40"
    >
      <span className="theme-icon-light">
        <SunIcon />
      </span>
      <span className="theme-icon-dark">
        <MoonIcon />
      </span>
    </button>
  );
}
