import type { Metadata } from "next";
import { localizedMetadata } from "@/lib/i18n/metadata";
import { AdminGuard } from "@/components/auth/admin-guard";
import { AdminCreate } from "@/components/admin/admin-create";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata("adminAdmins");
}

export default function AdminAdminsPage() {
  return (
    <AdminGuard>
      <AdminCreate />
    </AdminGuard>
  );
}
