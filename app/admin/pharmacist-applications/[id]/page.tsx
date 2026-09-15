import type { Metadata } from "next";
import { AdminGuard } from "@/components/auth/admin-guard";
import { ApplicationDetail } from "@/components/admin/application-detail";
import { localizedMetadata } from "@/lib/i18n/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata("applicationDetail");
}

export default async function PharmacistApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AdminGuard>
      {/* Keyed by id so opening another application resets the loaded state. */}
      <ApplicationDetail key={id} id={id} />
    </AdminGuard>
  );
}
