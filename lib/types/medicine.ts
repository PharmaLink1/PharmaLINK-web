export interface Medicine {
  id: string;
  genericName: string;
  brandNames: string[];
  category: string;
  /** Informational only — does not block search/display per PRD open question §14. */
  requiresPrescription: boolean;
}
