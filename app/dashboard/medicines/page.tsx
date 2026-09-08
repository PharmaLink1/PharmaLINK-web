import type { Metadata } from "next";
import { localizedMetadata } from "@/lib/i18n/metadata";
import { AuthGuard } from "@/components/auth/auth-guard";
import { MedicinesContent } from "@/components/dashboard/medicines/medicines-content";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata("medicines");
}

export default function MedicinesPage() {
  return (
    <AuthGuard>
      <MedicinesContent />
    </AuthGuard>
  );
}
