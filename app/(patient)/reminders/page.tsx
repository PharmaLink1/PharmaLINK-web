import { RemindersView } from "@/components/reminders/RemindersView";

/**
 * Page 12 — Reminders. Implemented per "Page 12 — Reminders/PRD.md" against
 * Figma node 48:1361 for the row/list layout. Lives under (patient), so
 * PatientTopNav / PatientBottomNav / PublicFooter already wrap it.
 */
export default function RemindersPage() {
  return <RemindersView />;
}
