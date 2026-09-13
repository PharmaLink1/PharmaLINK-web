export type UserRole = "patient" | "pharmacy_staff" | "admin";

export type PreferredLanguage = "en" | "am";

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  preferredLanguage: PreferredLanguage;
  /**
   * NEW field (Page 11 — Profile) — not in main prd.md §8 yet. The Go
   * backend needs an optional `avatar_url` column; until then this stays
   * undefined and every avatar falls back to the user's first initial.
   */
  avatarUrl?: string;
}
