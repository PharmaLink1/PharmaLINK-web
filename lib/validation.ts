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

export function validateFullName(value: string): string | undefined {
  if (!value.trim()) return "Full name is required.";
}

export function validateOtp(value: string): string | undefined {
  if (value.length !== OTP_LENGTH) return `Enter the ${OTP_LENGTH}-digit code.`;
  if (!/^\d+$/.test(value)) return "The code is digits only.";
}
