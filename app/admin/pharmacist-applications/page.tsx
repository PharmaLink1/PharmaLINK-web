import type { Metadata } from "next";
import { AdminGuard } from "@/components/auth/admin-guard";
import { ApplicationsReview } from "@/components/admin/applications-review";
import { localizedMetadata } from "@/lib/i18n/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata("applications");
}

export default function PharmacistApplicationsPage() {
  return (
    <AdminGuard>
      <ApplicationsReview />
    </AdminGuard>
  );
}
