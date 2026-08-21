import type { Metadata } from "next";
import { AuthGuard } from "@/components/auth/auth-guard";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export const metadata: Metadata = { title: "Dashboard — PharmaLink" };

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
