export type ReviewStatus = "pending" | "approved" | "rejected";

export interface DrugInfo {
  id: string;
  medicineId: string;
  summaryEn: string;
  summaryAm: string;
  sideEffects: string[];
  interactionFlags: string[];
  reviewStatus: ReviewStatus;
  reviewedBy: string | null;
  lastReviewedAt: string | null;
}
