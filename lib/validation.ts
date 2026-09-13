// Client-side validation that mirrors the backend's binding rules so users get
// immediate feedback before a request is sent. Messages come from the active
// language dictionary (read at call time, so they always match the UI language).
// Backend remains the final authority.

import { getCurrentDictionary, interpolate } from "@/lib/i18n/dictionaries";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const OTP_LENGTH = 6;
export const PASSWORD_MIN = 8;

export function validateEmail(value: string): string | undefined {
  const v = getCurrentDictionary().validation;
  if (!value.trim()) return v.emailRequired;
  if (!EMAIL_RE.test(value.trim())) return v.emailInvalid;
}

export function validatePassword(value: string): string | undefined {
  const v = getCurrentDictionary().validation;
  if (!value) return v.passwordRequired;
  if (value.length < PASSWORD_MIN) return interpolate(v.passwordTooShort, { min: PASSWORD_MIN });
}

/** Generic required-text check for the sign-up name/application fields. */
export function validateRequired(value: string, label: string): string | undefined {
  if (!value.trim()) return interpolate(getCurrentDictionary().validation.required, { label });
}

/** Phone number - loose E.164-style check; the backend remains the final authority. */
export function validatePhone(value: string): string | undefined {
  const v = getCurrentDictionary().validation;
  if (!value.trim()) return v.phoneRequired;
  if (!/^\+?\d{9,15}$/.test(value.trim())) return v.phoneInvalid;
}

/** Required URL check that mirrors the backend's `required,url` binding. */
export function validateUrl(value: string, label: string): string | undefined {
  const v = getCurrentDictionary().validation;
  const trimmed = value.trim();
  if (!trimmed) return interpolate(v.required, { label });
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return interpolate(v.urlInvalid, { label });
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return v.urlProtocol;
  }
}

export function validateOtp(value: string): string | undefined {
  const v = getCurrentDictionary().validation;
  if (value.length !== OTP_LENGTH) return interpolate(v.otpLength, { length: OTP_LENGTH });
  if (!/^\d+$/.test(value)) return v.otpDigits;
}
