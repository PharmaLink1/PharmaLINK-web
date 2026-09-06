import type { Metadata } from "next";
import { localizedMetadata } from "@/lib/i18n/metadata";
import { AuthGuard } from "@/components/auth/auth-guard";
import { InventoryContent } from "@/components/dashboard/inventory/inventory-content";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata("inventory");
}

export default function InventoryPage() {
  return (
    <AuthGuard>
      <InventoryContent />
    </AuthGuard>
  );
}
