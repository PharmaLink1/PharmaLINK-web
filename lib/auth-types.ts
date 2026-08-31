// Types mirroring the PharmaLink backend auth contract (source of truth:
// /c/Code/development/PharmaLINK-backend). Keep field names identical to the API.

export type Role = "user" | "pharmacist" | "admin";

// Account statuses gate whether an account may authenticate.
export type AccountStatus = "active" | "suspended";

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: Role;
  status?: AccountStatus; // present on /auth/me, absent on the login/verify user
};

/** GET /auth/me */
export type Me = User & {
  status: AccountStatus;
  pendingPharmacistApplication: boolean;
};

/** Returned by verify-otp / login / refresh (inside the success envelope's `data`). */
export type AuthResult = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

export type ApplicationStatus = "pending" | "approved" | "rejected";

/** A pharmacist application as returned by the admin review endpoints
 * (mirrors the backend's ApplicationResponse). */
export type PharmacistApplication = {
  id: string;
  userId: string;
  pharmacistDegreeCertificateUrl: string;
  status: ApplicationStatus;
  rejectReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
};

/** Standard success envelope: { success, message?, data }. */
export type ApiSuccess<T> = {
  success: true;
  message?: string;
  data: T;
};

/** Standard error envelope: { error: { code, message } }. */
export type ApiErrorBody = {
  error: { code: string; message: string };
};

/** Thrown by the API client for any non-2xx (or transport) failure. */
export class ApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}
