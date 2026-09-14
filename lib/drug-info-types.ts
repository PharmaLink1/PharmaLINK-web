// Read-side types for the drug-info endpoint (source of truth:
// /c/Code/development/PharmaLINK-backend, internal/drug_info/dto). Field names and
// JSON casing mirror the API response exactly (snake_case).

export type InteractionSeverity = "minor" | "moderate" | "severe";
export type DrugInfoSource = "official" | "user_submitted";

/** One interaction warning between the medicine and another one. */
export type DrugInteraction = {
  medicine_id: string;
  medicine_name: string;
  severity: InteractionSeverity;
  description: string;
};

/** GET /medicines/{medicine_id}/info response data. The summary is already
 * localized server-side (via ?lang= or the Accept-Language header the api-client
 * sends). last_edited_* are null until someone edits the content. */
export type DrugInfo = {
  medicine_id: string;
  generic_name: string;
  lang: string;
  summary: string;
  side_effects: string[];
  source: DrugInfoSource;
  source_name: string;
  last_edited_by: string | null;
  last_edited_at: string | null;
  interactions: DrugInteraction[];
  // A fixed English disclaimer from the backend; the UI renders its own localized
  // copy instead, so this field is intentionally not displayed.
  disclaimer: string;
};
