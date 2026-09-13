// The one place that talks to the backend. Handles the success/error envelopes,
// attaches the access token, sends the current language, and transparently
// refreshes once on a 401.
// Contract: /c/Code/development/PharmaLINK-backend (routes at root, no /api/v1).

import { ApiError, type ApiSuccess, type ApplicationStatus, type AuthResult, type CreateAdminRequest, type Me, type PharmacistApplication, type User } from "./auth-types";
import type {
  MedicineSearchParams,
  MedicineSearchResponse,
  MedicineSuggestion,
  NearbyPharmacy,
  NotifySubscribeRequest,
  NotifySubscribeResponse,
} from "./search-types";
import type {
  AdminPharmacy,
  CatalogMedicine,
  CreateMedicineRequest,
  InventoryListing,
  MyPharmacy,
  RegisterPharmacyRequest,
  RegisterPharmacyResponse,
  ReviewAction,
  SetListingRequest,
  VerifiedStatus,
} from "./pharmacy-types";
import { tokenStorage } from "./token-storage";
import { getCurrentLocale } from "./i18n/config";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean; // attach the Bearer access token
};

/** Low-level fetch: sends/parses JSON envelopes and throws ApiError on failure. */
async function raw<T>(path: string, { method = "GET", body, auth }: RequestOptions): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    // The backend localizes content (e.g. drug-info summaries) via this header;
    // the current language is always sent so every endpoint sees it.
    "Accept-Language": getCurrentLocale(),
  };
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
      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) return false;
      try {
        // No auth header here, and never retried — avoids a refresh loop.
        const data = await raw<AuthResult>("/auth/refresh", {
          method: "POST",
          body: { refreshToken },
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
  register(input: { email: string; password: string; firstName: string; lastName: string; phone: string }): Promise<null> {
    return raw<null>("/auth/register", { method: "POST", body: input });
  },

  /**
   * POST /auth/pharmacist/apply — starts the OTP flow carrying pharmacy details.
   * Like register, no account/tokens yet (202). On OTP verify the backend creates
   * a normal "patient" plus a pending pharmacist application for an admin to review.
   */
  applyPharmacist(input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    pharmacistDegreeCertificateUrl: string;
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
    const refreshToken = tokenStorage.getRefreshToken();
    try {
      if (refreshToken) await raw<null>("/auth/logout", { method: "POST", body: { refreshToken } });
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
  resetPassword(input: { email: string; otp: string; newPassword: string }): Promise<null> {
    return raw<null>("/auth/reset-password", { method: "POST", body: input });
  },

  /** POST /auth/change-password — authenticated; verifies the current password and
   * sets a new one (200). The backend revokes all sessions on success. */
  changePassword(input: { currentPassword: string; newPassword: string }): Promise<null> {
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

  /** POST /admin/admins — create another admin account. Admin only. Body is camelCase
   * (matches the auth endpoints); returns the created user. */
  createAdmin(body: CreateAdminRequest): Promise<User> {
    return request<User>("/admin/admins", { method: "POST", body });
  },
};

export const searchApi = {
  /** GET /medicines/autocomplete "—" lightweight as-you-type medicine-name suggestions. */
  autocomplete(query: string, limit = 8): Promise<MedicineSuggestion[]> {
    return raw<MedicineSuggestion[]>("/medicines/autocomplete?q=" + encodeURIComponent(query) + "&limit=" + limit, {});
  },

  /** GET /medicines/search "—" ranked stock results for a medicine query. Location
   * is only sent when the patient opted in; page is 1-based. radius_km rides along
   * only with a location, since it means nothing without one. */
  search(params: MedicineSearchParams): Promise<MedicineSearchResponse> {
    const query = new URLSearchParams();
    query.set("q", params.q);
    const hasLocation = params.lat !== undefined && params.lng !== undefined;
    if (hasLocation) {
      query.set("lat", String(params.lat));
      query.set("lng", String(params.lng));
      if (params.radius_km !== undefined) query.set("radius_km", String(params.radius_km));
    }
    if (params.dosage_form) query.set("dosage_form", params.dosage_form);
    if (params.status) query.set("status", params.status);
    if (params.page !== undefined) query.set("page", String(params.page));
    if (params.limit !== undefined) query.set("limit", String(params.limit));
    return raw<MedicineSearchResponse>("/medicines/search?" + query.toString(), {});
  },

  /** GET /medicines/search/nearby-fallback "—" verified pharmacies to call when a
   * search finds no stock. Requires a location. */
  nearbyFallback(lat: number, lng: number, limit = 8): Promise<NearbyPharmacy[]> {
    const query = new URLSearchParams();
    query.set("lat", String(lat));
    query.set("lng", String(lng));
    query.set("limit", String(limit));
    return raw<NearbyPharmacy[]>("/medicines/search/nearby-fallback?" + query.toString(), {});
  },
};

export const notifyApi = {
  /** POST /medicines/{medicine_id}/notify-me "—" subscribe the patient to a back-in-stock
   * alert near a location. Authenticated; the backend upserts, so re-subscribing is safe.
   * Omitting radiusKm takes the server default. */
  subscribe(medicineId: string, input: NotifySubscribeRequest): Promise<NotifySubscribeResponse> {
    const body: { lat: number; lng: number; radius_km?: number } = { lat: input.lat, lng: input.lng };
    if (input.radiusKm !== undefined) body.radius_km = input.radiusKm;
    return request<NotifySubscribeResponse>(
      "/medicines/" + encodeURIComponent(medicineId) + "/notify-me",
      { method: "POST", body },
    );
  },

  /** DELETE /medicines/notify-me/{subscription_id} "—" cancel an alert. Owner only;
   * returns 204 (raw resolves the empty body to null). */
  unsubscribe(subscriptionId: string): Promise<null> {
    return request<null>("/medicines/notify-me/" + encodeURIComponent(subscriptionId), {
      method: "DELETE",
    });
  },
};

export const pharmacyApi = {
  /** GET /pharmacies/mine "—" the caller's own pharmacies with verification status. */
  listMine(): Promise<MyPharmacy[]> {
    return request<MyPharmacy[]>("/pharmacies/mine", {});
  },

  /** POST /pharmacies "—" register a pharmacy. It starts pending until an admin verifies
   * it. This endpoint's body is camelCase (businessLicenseUrl), unlike the read side. */
  register(body: RegisterPharmacyRequest): Promise<RegisterPharmacyResponse> {
    return request<RegisterPharmacyResponse>("/pharmacies", { method: "POST", body });
  },
};

export const pharmacyAdminApi = {
  /** GET /admin/pharmacies?status= "—" the review queue. Admin only. */
  list(status?: VerifiedStatus): Promise<AdminPharmacy[]> {
    const query = status ? "?status=" + status : "";
    return request<AdminPharmacy[]>("/admin/pharmacies" + query, {});
  },

  /** POST /admin/pharmacies/{pharmacy_id}/review "—" verify or reject a pending pharmacy.
   * notes is the rejection reason on a reject. Admin only. */
  review(pharmacyID: string, action: ReviewAction, notes?: string): Promise<AdminPharmacy> {
    const body: { action: ReviewAction; notes?: string } = { action };
    if (notes !== undefined) body.notes = notes;
    return request<AdminPharmacy>(
      "/admin/pharmacies/" + encodeURIComponent(pharmacyID) + "/review",
      { method: "POST", body },
    );
  },
};

export const medicineApi = {
  /** GET /medicines?q= "—" catalogue medicines matching a name term. Pharmacist only. */
  list(term = "", limit = 20): Promise<CatalogMedicine[]> {
    const query = new URLSearchParams();
    if (term) query.set("q", term);
    query.set("limit", String(limit));
    return request<CatalogMedicine[]>("/medicines?" + query.toString(), {});
  },

  /** POST /medicines "—" add a medicine to the shared catalogue. Pharmacist only. */
  create(body: CreateMedicineRequest): Promise<CatalogMedicine> {
    return request<CatalogMedicine>("/medicines", { method: "POST", body });
  },
};

export const inventoryApi = {
  /** GET /pharmacies/{id}/inventory "—" a pharmacy's stock listings. Owner only. */
  list(pharmacyID: string): Promise<InventoryListing[]> {
    return request<InventoryListing[]>(
      "/pharmacies/" + encodeURIComponent(pharmacyID) + "/inventory",
      {},
    );
  },

  /** PUT /pharmacies/{id}/inventory "—" create or update a stock listing (upsert on
   * pharmacy + medicine). Owner only. */
  set(pharmacyID: string, body: SetListingRequest): Promise<InventoryListing> {
    return request<InventoryListing>(
      "/pharmacies/" + encodeURIComponent(pharmacyID) + "/inventory",
      { method: "PUT", body },
    );
  },

  /** DELETE /pharmacies/{id}/inventory/{medicine_id} "—" remove a listing. Owner only. */
  remove(pharmacyID: string, medicineID: string): Promise<null> {
    return request<null>(
      "/pharmacies/" +
        encodeURIComponent(pharmacyID) +
        "/inventory/" +
        encodeURIComponent(medicineID),
      { method: "DELETE" },
    );
  },
};
export type { ApiSuccess };
