// Types mirroring the PharmaLink backend auth contract (source of truth:
// /c/Code/development/PharmaLINK-backend). Keep field names identical to the API.

export type Role = "user" | "pharmacist" | "admin";
export type AccountStatus = "active" | "suspended";

export type User = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
};

/** GET /auth/me */
export type Me = User & {
  status: AccountStatus;
  pending_pharmacist_application: boolean;
};

/** Returned by verify-otp / login / refresh (inside the success envelope's `data`). */
export type AuthResult = {
  access_token: string;
  refresh_token: string;
  user: User;
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
