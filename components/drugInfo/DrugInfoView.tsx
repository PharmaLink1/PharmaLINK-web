"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Medicine } from "@/lib/types/medicine";
import type { DrugInfo } from "@/lib/types/drugInfo";
import { Callout } from "@/components/ui/Callout";
import {
  BackArrowIcon,
  BellFilledIcon,
  CheckmarkIcon,
  InfoCircleIcon,
  PrescriptionIcon,
  StockWarningIcon,
} from "@/components/ui/icons";
import { AddEditReminderDialog } from "@/components/reminders/AddEditReminderDialog";
import { Toast } from "@/components/reminders/Toast";
import { formatFarDate } from "@/lib/utils/reminders";
import { useTranslation } from "@/lib/i18n/useTranslation";

/**
 * Page 9 — Drug Info. Built from the PRD's exact tokens/copy (§3/§10) —
 * the Figma frame for this page couldn't be fetched (Figma MCP rate
 * limit hit mid-session), so this follows the PRD's already-locked hex
 * values and layout instead of guessing. Happy to true this up against
 * Figma later once the rate limit resets, if pixel-exact matters here.
 *
 * §6.4 gating (mandatory, not cosmetic): medical sections only render
 * when drugInfo.reviewStatus === "approved" — otherwise the safe
 * "not yet reviewed" state shows instead, never partial/unreviewed
 * content.
 */
export function DrugInfoView({ medicine, drugInfo }: { medicine: Medicine; drugInfo: DrugInfo | null }) {
  const { t } = useTranslation();
  const router = useRouter();
  const isReviewed = drugInfo?.reviewStatus === "approved";

  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-5 py-8 sm:px-6 sm:py-10">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
      >
        <BackArrowIcon />
        {t.common.back}
      </button>

      {/* Medicine header */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[22px] leading-7 font-semibold text-[var(--color-text-primary)]">
            {medicine.genericName}
          </h1>
          {medicine.requiresPrescription && (
            <span className="inline-flex items-center gap-1 rounded-[4px] border border-[var(--color-border)] px-[9px] py-[3px] text-xs font-medium text-[var(--color-text-secondary)]">
              <PrescriptionIcon />
              {t.drugInfo.prescriptionNeeded}
            </span>
          )}
        </div>
        {medicine.brandNames.length > 0 && (
          <p className="text-sm text-[var(--color-text-secondary)]">
            {t.drugInfo.alsoSoldAsPrefix}
            {medicine.brandNames.join(", ")}
          </p>
        )}
        <span className="inline-flex w-fit items-center rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-medium text-[var(--color-text-secondary)]">
          {medicine.category}
        </span>
      </div>

      {isReviewed && drugInfo ? (
        <>
          {/* Reviewed-by trust indicator */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[var(--radius-card)] border border-[var(--color-stock-in-border)] bg-[var(--color-stock-in-bg)] px-4 py-3">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-brand)]">
              <CheckmarkIcon />
              {t.drugInfo.reviewedBy}
            </span>
            {drugInfo.lastReviewedAt && (
              <span className="text-sm text-[var(--color-text-secondary)]">
                {t.drugInfo.lastReviewed} {formatFarDate(drugInfo.lastReviewedAt)}
              </span>
            )}
          </div>

          {/* What it's used for */}
          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-[var(--color-text-primary)]">{t.drugInfo.usedFor}</h2>
            <p className="text-[15px] leading-6 text-[var(--color-text-primary)]">{drugInfo.summaryEn}</p>
          </section>

          {/* Possible side effects — hidden when empty, per PRD §6 */}
          {drugInfo.sideEffects.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="text-base font-semibold text-[var(--color-text-primary)]">{t.drugInfo.sideEffects}</h2>
              <ul className="flex flex-col gap-1.5 text-[15px] text-[var(--color-text-primary)]">
                {drugInfo.sideEffects.map((effect) => (
                  <li key={effect} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-text-secondary)]" aria-hidden="true" />
                    {effect}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Warnings & interactions — hidden only if there's truly nothing
              to say (no flags AND no prescription note), per PRD §6. */}
          {(drugInfo.interactionFlags.length > 0 || medicine.requiresPrescription) && (
            <Callout variant="warning" title={t.drugInfo.warnings}>
              <div className="flex flex-col gap-2">
                <ul className="flex flex-col gap-1.5">
                  {drugInfo.interactionFlags.map((flag) => (
                    <li key={flag} className="flex items-start gap-2">
                      <StockWarningIcon className="mt-1 shrink-0" />
                      {flag}
                    </li>
                  ))}
                </ul>
                {medicine.requiresPrescription && (
                  <p className="flex items-start gap-2 font-medium">
                    <StockWarningIcon className="mt-1 shrink-0" />
                    {t.drugInfo.prescriptionNote}
                  </p>
                )}
              </div>
            </Callout>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] px-6 py-10 text-center">
          <p className="text-base font-medium text-[var(--color-text-primary)]">{t.drugInfo.notAvailable}</p>
        </div>
      )}

      {/* Disclaimer — always shown, reviewed or not */}
      <div className="flex items-start gap-2 rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] px-4 py-3">
        <InfoCircleIcon className="mt-0.5 shrink-0 text-[var(--color-text-secondary)]" />
        <p className="text-[13px] text-[var(--color-text-secondary)]">{t.drugInfo.disclaimer}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/search?q=${encodeURIComponent(medicine.genericName)}`}
          className="inline-flex h-12 flex-1 items-center justify-center rounded-[var(--radius-button)] bg-[var(--color-brand)] px-4 text-base font-semibold text-white transition-colors hover:bg-[var(--color-brand-hover)]"
        >
          {t.drugInfo.findPharmacies}
        </Link>
        <button
          type="button"
          onClick={() => setReminderDialogOpen(true)}
          className="inline-flex h-12 flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-button)] border border-[var(--color-brand)] px-4 text-base font-semibold text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand)]/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]/40"
        >
          <BellFilledIcon />
          {t.drugInfo.setReminder}
        </button>
      </div>

      {reminderDialogOpen && (
        <AddEditReminderDialog
          editingReminder={null}
          editingMedicine={medicine}
          onClose={() => setReminderDialogOpen(false)}
          onSaved={() => {
            setReminderDialogOpen(false);
            setToastMessage(t.drugInfo.reminderSavedToast);
          }}
        />
      )}

      {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}
    </div>
  );
}
