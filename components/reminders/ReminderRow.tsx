"use client";

import type { Medicine } from "@/lib/types/medicine";
import type { Reminder } from "@/lib/types/reminder";
import { ChannelPill } from "@/components/reminders/ChannelPill";
import { SnoozeClockIcon, ChevronRightIcon, CloseIcon } from "@/components/ui/icons";
import { describeDue } from "@/lib/utils/reminders";
import { useTranslation } from "@/lib/i18n/useTranslation";

/**
 * One reminder row — extracted from the Figma frame (node 48:1361), but
 * with real colored buttons for Snooze/Edit/Cancel instead of the flat
 * gray text links the frame shows, per explicit request: violet for
 * Snooze (a dedicated new accent, §3 globals.css), teal outline for Edit
 * (matches the "Edit" style already established on Profile), neutral
 * secondary for Cancel (never red — red stays reserved for errors).
 */
export function ReminderRow({
  reminder,
  medicine,
  isLast,
  onSnooze,
  onEdit,
  onCancel,
}: {
  reminder: Reminder;
  medicine: Medicine | undefined;
  isLast: boolean;
  onSnooze: () => void;
  onEdit: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const due = describeDue(reminder, t.reminders);

  return (
    <div
      className={`flex flex-col gap-3 p-6 sm:flex-row sm:items-start sm:justify-between ${
        isLast ? "" : "border-b border-[var(--color-border)]"
      }`}
    >
      <div className="flex flex-col gap-2">
        <p className="text-base font-medium text-[var(--color-text-primary)]">
          {medicine?.genericName ?? "—"}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col gap-0.5">
            <span
              className={`text-sm font-medium ${due.isOverdue ? "text-[var(--color-stock-low)]" : "text-[var(--color-text-secondary)]"}`}
            >
              {due.primary}
            </span>
            {due.secondary && (
              <span
                className={`text-sm ${due.isOverdue ? "text-[var(--color-stock-low)]" : "text-[var(--color-text-secondary)]"}`}
              >
                {due.secondary}
              </span>
            )}
          </div>
          <ChannelPill channel={reminder.channel} />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:shrink-0">
        <button
          type="button"
          onClick={onSnooze}
          className="inline-flex h-[44px] flex-1 items-center justify-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors sm:h-auto sm:flex-none sm:px-3 sm:py-1.5"
          style={{
            borderColor: "var(--color-accent-violet-border)",
            backgroundColor: "var(--color-accent-violet-bg)",
            color: "var(--color-accent-violet)",
          }}
        >
          <SnoozeClockIcon />
          {t.reminders.snoozeAction}
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-[44px] flex-1 items-center justify-center gap-1 rounded-full border border-[var(--color-brand)] px-3 text-[13px] font-medium text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand)]/5 sm:h-auto sm:flex-none sm:px-3 sm:py-1.5"
        >
          {t.profile.editButton}
          <ChevronRightIcon />
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-[44px] flex-1 items-center justify-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[13px] font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-canvas)] sm:h-auto sm:flex-none sm:px-3 sm:py-1.5"
        >
          <CloseIcon />
          {t.profile.cancelButton}
        </button>
      </div>
    </div>
  );
}
