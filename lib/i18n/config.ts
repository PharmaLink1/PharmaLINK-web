// Locale plumbing shared by the React provider and non-React modules (the API
// client, validation). Single source of truth for what "the current language"
// means on the client: an injected SSR hint (cookie) wins on first load, then
// localStorage, with an in-memory cache so reads are cheap. The server never
// touches this module's client state.

export const LOCALES = ["en", "am"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_STORAGE_KEY = "pharmalink-locale";
export const LOCALE_COOKIE_KEY = "pharmalink-locale";

// Set by the inline init script in the root layout before the bundle runs, so
// the very first client render matches the server-rendered language (no flash).
declare global {
  interface Window {
    __PHARMALINK_LOCALE__?: unknown;
  }
}

const listeners = new Set<() => void>();

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "am";
}

function readStoredLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(stored) ? stored : null;
  } catch {
    return null;
  }
}

/** Locale injected by the SSR init script (mirrors the request cookie). */
function readInjectedLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  return isLocale(window.__PHARMALINK_LOCALE__) ? window.__PHARMALINK_LOCALE__ : null;
}

// Initialized when the client bundle loads, so the first render already reflects
// the stored language (no English flash for Amharic users).
let cachedLocale: Locale = DEFAULT_LOCALE;
if (typeof window !== "undefined") {
  cachedLocale = readInjectedLocale() ?? readStoredLocale() ?? DEFAULT_LOCALE;
}

/** Current locale for non-React callers (e.g. the API client). */
export function getCurrentLocale(): Locale {
  return cachedLocale;
}

/** Client snapshot for useSyncExternalStore. */
export function getLocaleSnapshot(): Locale {
  return cachedLocale;
}

/**
 * SSR/hydration snapshot. The root layout renders from the request cookie and
 * passes the same value as `initialLocale`, so the server and first client
 * render agree and no language flashes after hydration.
 */
export function getServerLocaleSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

/** Subscribe to locale changes (used by useSyncExternalStore). */
export function subscribeLocale(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Keep other open tabs in sync when one changes the language.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === LOCALE_STORAGE_KEY && isLocale(event.newValue)) {
      setLocalePreference(event.newValue);
    }
  });
}

/**
 * Change the language: keeps the in-memory cache, localStorage, the <html> lang
 * attribute (Amharic is LTR, so no dir change), and a cookie the server can read
 * for SSR (metadata + initial lang) in sync. Subscribers are notified only when
 * the value actually changed; storage/cookie writes are idempotent.
 */
export function setLocalePreference(locale: Locale): void {
  if (!isLocale(locale)) return;
  const changed = locale !== cachedLocale;
  cachedLocale = locale;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // Storage may be unavailable (private mode); the in-memory value still applies.
    }
    document.documentElement.lang = locale;
    document.cookie = `${LOCALE_COOKIE_KEY}=${locale};path=/;max-age=31536000;samesite=lax`;
    if (changed) listeners.forEach((listener) => listener());
  }
}