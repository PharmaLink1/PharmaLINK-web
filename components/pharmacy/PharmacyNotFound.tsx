"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function PharmacyNotFound() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col px-4 py-10 sm:px-6">
      <EmptyState title={t.pharmacyDetail.notFoundTitle} description={t.pharmacyDetail.notFoundBody} />
    </div>
  );
}
