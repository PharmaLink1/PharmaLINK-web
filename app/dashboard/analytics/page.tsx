import type { Metadata } from "next";
import { localizedMetadata } from "@/lib/i18n/metadata";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AnalyticsContent } from "@/components/dashboard/analytics/analytics-content";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata("analytics");
}

export default function AnalyticsPage() {
  return (
    <AuthGuard>
      <AnalyticsContent />
    </AuthGuard>
  );
}
