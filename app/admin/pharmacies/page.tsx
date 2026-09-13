import type { Metadata } from "next";
import { localizedMetadata } from "@/lib/i18n/metadata";
import { AdminGuard } from "@/components/auth/admin-guard";
import { PharmacyReview } from "@/components/admin/pharmacy-review";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata("adminPharmacies");
}

export default function AdminPharmaciesPage() {
  return (
    <AdminGuard>
      <PharmacyReview />
    </AdminGuard>
  );
}
