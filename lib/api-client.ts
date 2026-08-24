// The one place that talks to the backend. Handles the success/error envelopes,
// attaches the access token, and transparently refreshes once on a 401.
// Contract: /c/Code/development/PharmaLINK-backend (routes at root, no /api/v1).

import { ApiError, type ApiSuccess, type ApplicationStatus, type AuthResult, type Me, type PharmacistApplication } from "./auth-types";
import { tokenStorage } from "./token-storage";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean; // attach the Bearer access token
};

/** Low-level fetch: sends/parses JSON envelopes and throws ApiError on failure. */
async function raw<T>(path: string, { method = "GET", body, auth }: RequestOptions): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = tokenStorage.getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("NETWORK_ERROR", "Can't reach the server. Check your connection.", 0);
  }

  const text = await res.text();
  const json = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const code = json?.error?.code ?? "REQUEST_FAILED";
    const message = json?.error?.message ?? "Something went wrong. Please try again.";
    throw new ApiError(code, message, res.status);
  }

  return (json?.data ?? null) as T;
}

// Dedupe concurrent refreshes so many parallel 401s trigger only one refresh.
let refreshing: Promise<boolean> | null = null;

function refreshTokens(): Promise<boolean> {
  if (!refreshing) {
    refreshing = (async () => {
      const refresh_token = tokenStorage.getRefreshToken();
      if (!refresh_token) return false;
      try {
        // No auth header here, and never retried — avoids a refresh loop.
        const data = await raw<AuthResult>("/auth/refresh", {
          method: "POST",
          body: { refresh_token },
        });
        tokenStorage.setTokens(data);
        return true;
      } catch {
        tokenStorage.clear();
        return false;
      }
    })().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

/** Authenticated request that refreshes once and retries on a 401. */
async function request<T>(path: string, opts: RequestOptions): Promise<T> {
  try {
    return await raw<T>(path, { ...opts, auth: true });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401 && (await refreshTokens())) {
      return raw<T>(path, { ...opts, auth: true });
    }
    throw err;
  }
}

export const authApi = {
  /** POST /auth/register — starts OTP flow; no account/tokens yet (202). */
  register(input: { email: string; password: string; full_name: string }): Promise<null> {
    return raw<null>("/auth/register", { method: "POST", body: input });
  },

  /**
   * POST /auth/pharmacist/apply — starts the OTP flow carrying pharmacy details.
   * Like register, no account/tokens yet (202). On OTP verify the backend creates
   * a normal "user" plus a pending pharmacist application for an admin to review.
   */
  applyPharmacist(input: {
    email: string;
    password: string;
    full_name: string;
    pharmacy_name: string;
    license_number: string;
    address: string;
  }): Promise<null> {
    return raw<null>("/auth/pharmacist/apply", { method: "POST", body: input });
  },

  /** POST /auth/verify-otp — creates the account and starts a session (201). */
  async verifyOtp(input: { email: string; otp: string }): Promise<AuthResult> {
    const data = await raw<AuthResult>("/auth/verify-otp", { method: "POST", body: input });
    tokenStorage.setTokens(data);
    return data;
  },

  /** POST /auth/login — email + password (no OTP). */
  async login(input: { email: string; password: string }): Promise<AuthResult> {
    const data = await raw<AuthResult>("/auth/login", { method: "POST", body: input });
    tokenStorage.setTokens(data);
    return data;
  },

  /** POST /auth/logout — revokes the refresh token, then clears local session. */
  async logout(): Promise<void> {
    const refresh_token = tokenStorage.getRefreshToken();
    try {
      if (refresh_token) await raw<null>("/auth/logout", { method: "POST", body: { refresh_token } });
    } finally {
      tokenStorage.clear();
    }
  },

  /** POST /auth/forgot-password — emails a reset OTP. Always 202; never reveals
   * whether the email is registered. */
  forgotPassword(input: { email: string }): Promise<null> {
    return raw<null>("/auth/forgot-password", { method: "POST", body: input });
  },

  /** POST /auth/reset-password — verifies the OTP and sets a new password (200).
   * Returns no tokens: the backend revokes all sessions, so the user must sign in. */
  resetPassword(input: { email: string; otp: string; new_password: string }): Promise<null> {
    return raw<null>("/auth/reset-password", { method: "POST", body: input });
  },

  /** POST /auth/change-password — authenticated; verifies the current password and
   * sets a new one (200). The backend revokes all sessions on success. */
  changePassword(input: { current_password: string; new_password: string }): Promise<null> {
    return request<null>("/auth/change-password", { method: "POST", body: input });
  },

  /** GET /auth/me — current user, role/status, and pending-application flag. */
  me(): Promise<Me> {
    return request<Me>("/auth/me", {});
  },
};

export const adminApi = {
  /** GET /admin/pharmacist-applications?status= — review queue, optionally
   * filtered by status. Admin only. */
  listApplications(status?: ApplicationStatus): Promise<PharmacistApplication[]> {
    const query = status ? `?status=${status}` : "";
    return request<PharmacistApplication[]>(`/admin/pharmacist-applications${query}`, {});
  },

  /** POST /admin/pharmacist-applications/:id/approve — approves and promotes the
   * applicant to pharmacist. Admin only. */
  approveApplication(id: string): Promise<PharmacistApplication> {
    return request<PharmacistApplication>(`/admin/pharmacist-applications/${id}/approve`, {
      method: "POST",
    });
  },

  /** POST /admin/pharmacist-applications/:id/reject — rejects with a required
   * reason. Admin only. */
  rejectApplication(id: string, reason: string): Promise<PharmacistApplication> {
    return request<PharmacistApplication>(`/admin/pharmacist-applications/${id}/reject`, {
      method: "POST",
      body: { reason },
    });
  },
};

export type { ApiSuccess };
