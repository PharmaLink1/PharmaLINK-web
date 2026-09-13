import type { DrugInfo } from "@/lib/types/drugInfo";

/**
 * Mock Drug Info entries — deliberately covers both states Page 9's PRD
 * requires (§6): med_1/med_2 are "approved" so the reviewed content
 * renders; med_3 has no entry at all, exercising the mandatory
 * not-yet-reviewed gate (§6.4 — never show unreviewed medical content).
 *
 * All body text below is PLACEHOLDER FOR LAYOUT ONLY, copied directly from
 * the PRD's own example text (§10) — real summaries/side-effects/warnings
 * must be pharmacist-authored and reviewed before this ships (§6.4, §9.2).
 */
export const mockDrugInfo: DrugInfo[] = [
  {
    id: "drug_info_1",
    medicineId: "med_1",
    summaryEn:
      "Paracetamol is used to relieve mild to moderate pain and to reduce fever. [Placeholder — real content must be pharmacist-authored.]",
    summaryAm: "",
    sideEffects: ["Nausea", "Skin rash (rare)", "Stomach discomfort"],
    interactionFlags: [
      "Do not take with other medicines that also contain paracetamol.",
      "Tell your pharmacist if you have liver problems.",
      "Ask before combining with other medicines.",
    ],
    reviewStatus: "approved",
    reviewedBy: "Dr. Selamawit Bekele, PharmD",
    lastReviewedAt: "2026-05-12",
  },
  {
    id: "drug_info_2",
    medicineId: "med_2",
    summaryEn:
      "Amoxicillin is an antibiotic used to treat certain bacterial infections. [Placeholder — real content must be pharmacist-authored.]",
    summaryAm: "",
    sideEffects: ["Diarrhea", "Nausea", "Rash"],
    interactionFlags: [
      "Finish the full course even if you feel better.",
      "Tell your pharmacist if you are allergic to penicillin.",
    ],
    reviewStatus: "approved",
    reviewedBy: "Dr. Selamawit Bekele, PharmD",
    lastReviewedAt: "2026-04-28",
  },
  // med_3 (Metformin) intentionally has no entry — exercises the
  // "not yet reviewed" safe state.
];
