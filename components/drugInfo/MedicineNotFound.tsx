"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function MedicineNotFound() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col px-5 py-10 sm:px-6">
      <EmptyState title={t.drugInfo.medicineNotFoundTitle} description={t.drugInfo.medicineNotFoundBody} />
    </div>
  );
}
