"use client";

import { createContext, useCallback, useEffect, useState, type ReactNode } from "react";
import type { PreferredLanguage } from "@/lib/types/user";

export interface LanguageContextValue {
  language: PreferredLanguage;
  setLanguage: (language: PreferredLanguage) => void;
  toggleLanguage: () => void;
}

export const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = "pharmalink_language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Always starts at "en" on both the server render and the client's first
  // (hydration) render, so they never mismatch. The old version called
  // `readStoredLanguage()` directly inside useState's initializer, which
  // returns "en" on the server (no window) but the REAL stored value on
  // the client's very first render — an immediate hydration mismatch
  // whenever "am" was stored (same bug class ThemeContext had before it
  // was fixed). The real stored preference is applied a moment later,
  // once we're safely past hydration.
  const [language, setLanguageState] = useState<PreferredLanguage>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "am") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional post-hydration sync from localStorage
      setLanguageState("am");
    }
  }, []);

  const setLanguage = useCallback((next: PreferredLanguage) => {
    setLanguageState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "en" ? "am" : "en");
  }, [language, setLanguage]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
