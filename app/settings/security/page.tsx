import type { Metadata } from "next";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SecurityContent } from "@/components/auth/security-content";
import { localizedMetadata } from "@/lib/i18n/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata("security");
}

export default function SecuritySettingsPage() {
  return (
    <AuthGuard>
      <SecurityContent />
    </AuthGuard>
  );
}
