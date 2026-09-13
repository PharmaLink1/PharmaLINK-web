"use client";

import * as React from "react";
import {
  getLocaleSnapshot,
  getServerLocaleSnapshot,
  setLocalePreference,
  subscribeLocale,
  type Locale,
} from "@/lib/i18n/config";
import { dictionaries, type Dictionary } from "@/lib/i18n/dictionaries";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
};

const LanguageContext = React.createContext<LanguageContextValue | null>(null);

/**
 * Language provider for PharmaLink. English is the default; the stored language
 * (localStorage, synced to a cookie for the server) is applied on mount. The
 * root layout passes the request-cookie locale as `initialLocale` so the server
 * render and the first client render agree (no flash, no hydration mismatch),
 * and an inline init script sets <html lang> before first paint. Follows the
 * same useSyncExternalStore pattern as the theme provider and stays in sync
 * across tabs through the storage event.
 */
export function LanguageProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const locale = React.useSyncExternalStore(
    subscribeLocale,
    getLocaleSnapshot,
    () => initialLocale ?? getServerLocaleSnapshot(),
  );

  // Keep <html lang> and the SSR cookie aligned with the stored preference
  // (covers the first visit and any environment where the init script couldn't run).
  React.useEffect(() => {
    document.documentElement.lang = locale;
    setLocalePreference(locale);
  }, [locale]);

  const value = React.useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale: setLocalePreference,
      t: dictionaries[locale],
    }),
    [locale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = React.useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
}

export { interpolate } from "@/lib/i18n/dictionaries";