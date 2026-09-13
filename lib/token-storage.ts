// Single source of truth for auth token persistence. Swappable: today it uses
// localStorage; to move to httpOnly cookies later, reimplement this module only.
// Nothing else in the app should touch storage directly.

import type { AuthResult } from "./auth-types";

const ACCESS_KEY = "pharmalink.access_token";
const REFRESH_KEY = "pharmalink.refresh_token";

const listeners = new Set<() => void>();
const hasWindow = () => typeof window !== "undefined";

export const tokenStorage = {
  getAccessToken(): string | null {
    return hasWindow() ? window.localStorage.getItem(ACCESS_KEY) : null;
  },

  getRefreshToken(): string | null {
    return hasWindow() ? window.localStorage.getItem(REFRESH_KEY) : null;
  },

  setTokens(tokens: Pick<AuthResult, "accessToken" | "refreshToken">) {
    if (!hasWindow()) return;
    window.localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    window.localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
    notify();
  },

  clear() {
    if (!hasWindow()) return;
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
    notify();
  },

  /** Subscribe to token changes (used by the session context). Returns an unsubscribe. */
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

function notify() {
  for (const listener of listeners) listener();
}
