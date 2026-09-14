import type { Metadata } from "next";
import { localizedMetadata } from "@/lib/i18n/metadata";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PharmacyLocatorContent } from "@/components/dashboard/pharmacy/pharmacy-locator-content";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata("nearbyPharmacies");
}

export default function PharmaciesPage() {
  return (
    <AuthGuard>
      <PharmacyLocatorContent />
    </AuthGuard>
  );
}
