// Client-side validation that mirrors the backend's binding rules so users get
// immediate feedback before a request is sent. Backend remains the final authority.

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const OTP_LENGTH = 6;
export const PASSWORD_MIN = 8;

export function validateEmail(value: string): string | undefined {
  if (!value.trim()) return "Email is required.";
  if (!EMAIL_RE.test(value.trim())) return "Enter a valid email address.";
}

export function validatePassword(value: string): string | undefined {
  if (!value) return "Password is required.";
  if (value.length < PASSWORD_MIN) return `Password must be at least ${PASSWORD_MIN} characters.`;
}

/** Generic required-text check for the sign-up name/application fields. */
export function validateRequired(value: string, label: string): string | undefined {
  if (!value.trim()) return `${label} is required.`;
}

/** Phone number — loose E.164-style check; the backend remains the final authority. */
export function validatePhone(value: string): string | undefined {
  if (!value.trim()) return "Phone number is required.";
  if (!/^\+?\d{9,15}$/.test(value.trim())) return "Enter a valid phone number, e.g. +251911234567.";
}

/** Required URL check that mirrors the backend's `required,url` binding. */
export function validateUrl(value: string, label: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return `${label} is required.`;
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return `Enter a valid URL for ${label.toLowerCase()}.`;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return "Enter a URL starting with http:// or https://.";
  }
}

export function validateOtp(value: string): string | undefined {
  if (value.length !== OTP_LENGTH) return `Enter the ${OTP_LENGTH}-digit code.`;
  if (!/^\d+$/.test(value)) return "The code is digits only.";
}
