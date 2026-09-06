import type { Metadata } from "next";
import { localizedMetadata } from "@/lib/i18n/metadata";
import { AdminGuard } from "@/components/auth/admin-guard";
import { MedicineCatalog } from "@/components/admin/medicine-catalog";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata("adminMedicines");
}

export default function AdminMedicinesPage() {
  return (
    <AdminGuard>
      <MedicineCatalog />
    </AdminGuard>
  );
}
