import type { Metadata } from "next";
import { localizedMetadata } from "@/lib/i18n/metadata";
import { PatientGuard } from "@/components/auth/patient-guard";
import { RemindersContent } from "@/components/dashboard/reminders/reminders-content";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata("reminders");
}

export default function RemindersPage() {
  return (
    <PatientGuard>
      <RemindersContent />
    </PatientGuard>
  );
}
