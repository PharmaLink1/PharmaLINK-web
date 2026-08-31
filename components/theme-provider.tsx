"use client";

import * as React from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "pharmalink-theme";

let cachedTheme: Theme = "light";
const listeners = new Set<() => void>();

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  cachedTheme = theme;
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage may be unavailable (private mode); the class still applies.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY && (event.newValue === "light" || event.newValue === "dark")) {
      cachedTheme = event.newValue;
      onStoreChange();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

const ThemeContext = React.createContext<{
  theme: Theme;
  toggleTheme: () => void;
} | null>(null);

/**
 * Theme provider for PharmaLink. Light is the default; the stored (or OS)
 * preference is applied after mount via useSyncExternalStore, and the inline
 * init script in the root layout sets `.dark` before first paint to avoid a
 * flash. Synced across tabs through the `storage` event.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = React.useSyncExternalStore(
    subscribe,
    () => cachedTheme,
    () => "light" as Theme,
  );

  React.useEffect(() => {
    const initial = readStoredTheme();
    if (initial !== cachedTheme) applyTheme(initial);
  }, []);

  const value = React.useMemo(
    () => ({
      theme,
      toggleTheme: () => applyTheme(theme === "dark" ? "light" : "dark"),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}