import type { Metadata } from "next";
import { localizedMetadata } from "@/lib/i18n/metadata";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PharmacyContent } from "@/components/dashboard/pharmacy/pharmacy-content";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata("pharmacy");
}

export default function PharmacyPage() {
  return (
    <AuthGuard>
      <PharmacyContent />
    </AuthGuard>
  );
}
