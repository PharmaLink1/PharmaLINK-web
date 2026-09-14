import type { Metadata } from "next";
import { localizedMetadata } from "@/lib/i18n/metadata";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PharmacyDetailContent } from "@/components/dashboard/pharmacy/pharmacy-detail-content";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata("pharmacyDetail");
}

export default async function PharmacyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AuthGuard>
      <PharmacyDetailContent id={id} />
    </AuthGuard>
  );
}
