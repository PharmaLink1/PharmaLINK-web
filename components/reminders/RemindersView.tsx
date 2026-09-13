"use client";

import { useCallback, useEffect, useState } from "react";
import type { Medicine } from "@/lib/types/medicine";
import type { Reminder } from "@/lib/types/reminder";
import { cancelReminder, listReminders, snoozeReminder } from "@/lib/api/reminders";
import { getMedicineById } from "@/lib/api/medicines";
import { sortByDueDate } from "@/lib/utils/reminders";
import { ReminderRow } from "@/components/reminders/ReminderRow";
import { EmptyRemindersState } from "@/components/reminders/EmptyRemindersState";
import { AddEditReminderDialog } from "@/components/reminders/AddEditReminderDialog";
import { Toast } from "@/components/reminders/Toast";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { Skeleton } from "@/components/ui/Skeleton";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useTranslation } from "@/lib/i18n/useTranslation";

type ViewStatus = "loading" | "ready" | "error";

/**
 * Page 12 — Reminders. Loads via lib/api/reminders.ts (now with real mock
 * persistence, PRD §11 problem 1), resolves each reminder's medicine name,
 * and owns the Add/Edit dialog + Snooze/Cancel actions + toast feedback.
 */
export function RemindersView() {
  const { t } = useTranslation();
  const isOnline = useOnlineStatus();

  const [status, setStatus] = useState<ViewStatus>("loading");
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [medicinesById, setMedicinesById] = useState<Record<string, Medicine>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [dialogState, setDialogState] = useState<{ reminder: Reminder | null } | null>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const list = await listReminders();
      const uniqueMedicineIds = [...new Set(list.map((r) => r.medicineId))];
      const medicines = await Promise.all(uniqueMedicineIds.map((id) => getMedicineById(id)));
      const byId: Record<string, Medicine> = {};
      medicines.forEach((m) => {
        if (m) byId[m.id] = m;
      });
      setReminders(sortByDueDate(list));
      setMedicinesById(byId);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    // Intentional fetch-on-mount, same pattern as AuthContext's refresh().
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function handleSnooze(reminder: Reminder) {
    try {
      await snoozeReminder(reminder.id);
      await load();
      setToastMessage(t.reminders.snoozedToast);
    } catch {
      // Non-blocking action — a silent no-op on failure is preferable to a
      // dialog for something this low-stakes; the row simply doesn't change.
    }
  }

  async function handleCancel(reminder: Reminder) {
    try {
      await cancelReminder(reminder.id);
      await load();
      setToastMessage(t.reminders.cancelledToast);
    } catch {
      // See handleSnooze — same low-stakes, non-blocking treatment.
    }
  }

  function openAddDialog() {
    setDialogState({ reminder: null });
  }
  function openEditDialog(reminder: Reminder) {
    setDialogState({ reminder });
  }

  return (
    <div className="mx-auto flex w-full max-w-[680px] flex-col gap-6 px-5 py-8 sm:px-6 sm:py-10">
      {!isOnline && <Callout variant="error">{t.reminders.offlineBanner}</Callout>}

      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">{t.nav.reminders}</h1>
        <Button type="button" onClick={openAddDialog} disabled={!isOnline} className="hidden sm:inline-flex">
          {t.reminders.addReminderButton}
        </Button>
      </div>
      <Button type="button" onClick={openAddDialog} disabled={!isOnline} className="w-full sm:hidden">
        {t.reminders.addReminderButton}
      </Button>

      {status === "loading" && (
        <div className="flex flex-col gap-3" aria-busy="true" aria-live="polite">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {status === "error" && (
        <Callout variant="error">{t.common.errorGeneric}</Callout>
      )}

      {status === "ready" && reminders.length === 0 && <EmptyRemindersState onAdd={openAddDialog} />}

      {status === "ready" && reminders.length > 0 && (
        <div className="flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          {reminders.map((reminder, index) => (
            <ReminderRow
              key={reminder.id}
              reminder={reminder}
              medicine={medicinesById[reminder.medicineId]}
              isLast={index === reminders.length - 1}
              onSnooze={() => handleSnooze(reminder)}
              onEdit={() => openEditDialog(reminder)}
              onCancel={() => handleCancel(reminder)}
            />
          ))}
        </div>
      )}

      {dialogState && (
        <AddEditReminderDialog
          editingReminder={dialogState.reminder}
          editingMedicine={dialogState.reminder ? medicinesById[dialogState.reminder.medicineId] ?? null : null}
          onClose={() => setDialogState(null)}
          onSaved={() => {
            setDialogState(null);
            load();
          }}
        />
      )}

      {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}
    </div>
  );
}
