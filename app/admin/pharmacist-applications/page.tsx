import type { Metadata } from "next";
import { AdminGuard } from "@/components/auth/admin-guard";
import { ApplicationsReview } from "@/components/admin/applications-review";

export const metadata: Metadata = { title: "Pharmacist applications — PharmaLink" };

export default function PharmacistApplicationsPage() {
  return (
    <AdminGuard>
      <ApplicationsReview />
    </AdminGuard>
  );
}
