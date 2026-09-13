"use client";

import { createContext, useCallback, useEffect, useState, type ReactNode } from "react";

export type Theme = "light" | "dark";

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "pharmalink_theme";

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : getSystemTheme();
}

/**
 * Manual light/dark override on top of the system-preference CSS in
 * globals.css. The `data-theme` attribute is applied to <html> before
 * hydration by the theme-init script in app/layout.tsx, so the correct
 * colors paint immediately.
 *
 * IMPORTANT: state starts as `null` rather than reading localStorage during
 * render. Reading it during render would make the client's first render
 * disagree with the server's HTML (which has no access to localStorage) and
 * trigger a hydration mismatch. It's resolved right after mount instead.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme | null>(null);

  useEffect(() => {
    // Post-mount sync of the pre-hydration script's decision into React state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(readStoredTheme());
  }, []);

  useEffect(() => {
    // Skipped until the theme is resolved, so we never overwrite the
    // attribute the theme-init script already set (which would flash).
    if (theme) {
      document.documentElement.dataset.theme = theme;
    }
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    // Falls back to the live value so the very first click is correct even
    // if it happens before the post-mount sync lands.
    const current = theme ?? readStoredTheme();
    setTheme(current === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme: theme ?? "light", setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
