/**
 * Shared validation constants used across the auth forms (Login, Patient
 * Registration, Pharmacy Staff Registration), so the rules stay identical
 * everywhere instead of drifting between copy-pasted regexes.
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Personal mobile numbers: 09xxxxxxxx (10 digits) or +2519xxxxxxxx. */
export const MOBILE_PHONE_REGEX = /^(?:\+2519\d{8}|09\d{8})$/;

/** Business/pharmacy phones — broader than mobile-only since Ethiopian
 * landlines (e.g. 011xxxxxxx) are common for a pharmacy's listed number. */
export const GENERAL_PHONE_REGEX = /^(?:\+251\d{9}|0\d{9})$/;

export const MIN_PASSWORD_LENGTH = 8;
