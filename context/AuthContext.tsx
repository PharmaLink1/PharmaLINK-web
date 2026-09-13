"use client";

import { createContext, useCallback, useEffect, useState, type ReactNode } from "react";
import type { User } from "@/lib/types/user";
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  signupPatient as signupPatientRequest,
  signupPharmacyStaff as signupPharmacyStaffRequest,
  updateProfile as updateProfileRequest,
  changePassword as changePasswordRequest,
  updateProfilePhoto as updateProfilePhotoRequest,
} from "@/lib/api/auth";
import type { LoginPayload, SignupPatientPayload, SignupPharmacyStaffPayload } from "@/lib/api/auth";

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  signupPatient: (payload: SignupPatientPayload) => Promise<User>;
  signupPharmacyStaff: (payload: SignupPharmacyStaffPayload) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  /** Page 11 — Profile: editable subset of the current user's fields. */
  updateProfile: (fields: Partial<Pick<User, "name" | "phone" | "email" | "preferredLanguage">>) => Promise<User>;
  /** Page 11 — Profile: authenticated password change, distinct from Page 5's OTP reset. */
  changePassword: (payload: { currentPassword: string; newPassword: string }) => Promise<void>;
  /** Page 11 — Profile: single-image avatar upload; updates `user.avatarUrl` on success. */
  updateProfilePhoto: (file: File) => Promise<User>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const current = await getCurrentUser();
    setUser(current);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Fetch-on-mount session check; intentionally fires an async refresh
    // rather than synchronous setState.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const login = useCallback(async (payload: LoginPayload) => {
    const loggedInUser = await loginRequest(payload);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  // Signup logs the user in immediately on success (Page 3 PRD §6: "no
  // separate screen — user is logged in and redirected"), same as login.
  const signupPatient = useCallback(async (payload: SignupPatientPayload) => {
    const newUser = await signupPatientRequest(payload);
    setUser(newUser);
    return newUser;
  }, []);

  // Does NOT redirect anywhere on success (unlike signupPatient) — Page 4's
  // PRD is explicit that this is a "pending review" state shown in place on
  // this same page, not a dashboard redirect (there's no dashboard access
  // until an admin approves the pharmacy).
  const signupPharmacyStaff = useCallback(async (payload: SignupPharmacyStaffPayload) => {
    const newUser = await signupPharmacyStaffRequest(payload);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (fields: Partial<Pick<User, "name" | "phone" | "email" | "preferredLanguage">>) => {
      const updated = await updateProfileRequest(fields);
      setUser(updated);
      return updated;
    },
    []
  );

  const changePassword = useCallback(
    async (payload: { currentPassword: string; newPassword: string }) => {
      await changePasswordRequest(payload);
    },
    []
  );

  const updateProfilePhoto = useCallback(
    async (file: File) => {
      const { avatarUrl } = await updateProfilePhotoRequest(file);
      if (!user) throw new Error("Not signed in.");
      const updated: User = { ...user, avatarUrl };
      setUser(updated);
      return updated;
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signupPatient,
        signupPharmacyStaff,
        logout,
        refresh,
        updateProfile,
        changePassword,
        updateProfilePhoto,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
