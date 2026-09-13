import type { ReactNode } from "react";
import { PatientTopNav } from "@/components/layout/PatientTopNav";
import { PatientBottomNav } from "@/components/layout/PatientBottomNav";
import { PublicFooter } from "@/components/layout/PublicFooter";

/**
 * Shared shell for all patient-role routes — locked in by Page 6 (Patient
 * Home, node 6:355 "Header - TopNavBar"): a desktop top nav bar and a
 * mobile bottom nav bar, both showing the same Search/Reminders/Profile
 * tabs. Reuses the same PublicFooter as the landing/registration pages for
 * consistency rather than a one-off patient-specific footer.
 */
export default function PatientLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-canvas)] pb-16 md:pb-0">
      <PatientTopNav />
      <main className="flex-1">{children}</main>
      <PublicFooter />
      <PatientBottomNav />
    </div>
  );
}
