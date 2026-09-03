import type { Metadata } from "next";
import { AuthGuard } from "@/components/auth/auth-guard";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { localizedMetadata } from "@/lib/i18n/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata("dashboard");
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
