import { ApiError } from "@/lib/auth-types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

// Curated, localized messages for the API error codes the UI actually handles.
// Unknown codes keep the backend's own (English) message — we never machine
// translate server copy on the fly.
const CODE_MESSAGES: Record<string, (t: Dictionary) => string> = {
  NETWORK_ERROR: (t) => t.errors.network,
  INVALID_CREDENTIALS: (t) => t.errors.invalidCredentials,
  EMAIL_TAKEN: (t) => t.errors.emailTaken,
  INVALID_OTP: (t) => t.errors.invalidOtp,
  NO_PENDING_SIGNUP: (t) => t.errors.noPendingSignup,
  NO_PASSWORD_RESET: (t) => t.errors.noPasswordReset,
  INCORRECT_PASSWORD: (t) => t.errors.incorrectPassword,
};

/** Human message for a thrown error in the current language. */
export function getErrorMessage(err: unknown, t: Dictionary): string {
  if (err instanceof ApiError) {
    const message = CODE_MESSAGES[err.code];
    if (message) return message(t);
    return err.message || t.errors.generic;
  }
  return t.errors.generic;
}
