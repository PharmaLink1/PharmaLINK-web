"use client";

import * as React from "react";
import { authApi } from "@/lib/api-client";
import { tokenStorage } from "@/lib/token-storage";
import type { Me } from "@/lib/auth-types";

type Status = "loading" | "authenticated" | "unauthenticated";

type SessionContextValue = {
  status: Status;
  user: Me | null;
  login: (input: { email: string; password: string }) => Promise<void>;
  verifyOtp: (input: { email: string; otp: string }) => Promise<void>;
  signup: (input: { email: string; password: string; full_name: string }) => Promise<void>;
  applyPharmacist: (input: {
    email: string;
    password: string;
    full_name: string;
    pharmacy_name: string;
    license_number: string;
    address: string;
  }) => Promise<void>;
  forgotPassword: (input: { email: string }) => Promise<void>;
  resetPassword: (input: { email: string; otp: string; new_password: string }) => Promise<void>;
  changePassword: (input: { current_password: string; new_password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const SessionContext = React.createContext<SessionContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState<Status>("loading");
  const [user, setUser] = React.useState<Me | null>(null);

  const hydrate = React.useCallback(async () => {
    if (!tokenStorage.getAccessToken()) {
      setUser(null);
      setStatus("unauthenticated");
      return;
    }
    try {
      const me = await authApi.me();
      setUser(me);
      setStatus("authenticated");
    } catch {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  React.useEffect(() => {
    // Defer the mount hydration off the synchronous effect path.
    queueMicrotask(() => {
      void hydrate();
    });
    // React when tokens are cleared elsewhere (e.g. a failed refresh in the API client).
    const unsubscribe = tokenStorage.subscribe(() => {
      if (!tokenStorage.getAccessToken()) {
        setUser(null);
        setStatus("unauthenticated");
      }
    });
    return unsubscribe;
  }, [hydrate]);

  const value: SessionContextValue = {
    status,
    user,
    login: async (input) => {
      await authApi.login(input);
      await hydrate();
    },
    verifyOtp: async (input) => {
      await authApi.verifyOtp(input);
      await hydrate();
    },
    signup: async (input) => {
      await authApi.register(input);
    },
    applyPharmacist: async (input) => {
      await authApi.applyPharmacist(input);
    },
    forgotPassword: async (input) => {
      await authApi.forgotPassword(input);
    },
    resetPassword: async (input) => {
      await authApi.resetPassword(input);
    },
    changePassword: async (input) => {
      await authApi.changePassword(input);
    },
    logout: async () => {
      await authApi.logout();
      setUser(null);
      setStatus("unauthenticated");
    },
    refresh: hydrate,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = React.useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within <AuthProvider>.");
  return ctx;
}
