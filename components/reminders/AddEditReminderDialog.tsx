"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import type { Medicine } from "@/lib/types/medicine";
import type { Reminder, ReminderCadence, ReminderChannel } from "@/lib/types/reminder";
import { createReminder, updateReminder } from "@/lib/api/reminders";
import { MedicinePicker } from "@/components/reminders/MedicinePicker";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { BellFilledIcon, SmsIcon } from "@/components/ui/icons";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_INTERVAL_DAYS = 30; // prd.md §6.5's own example ("every 30 days")

type MedicineErrorCode = "empty";
type DateErrorCode = "empty";
type IntervalErrorCode = "invalid";
type FormErrorCode = "generic";

function todayDateInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Add/Edit reminder — a genuine MODAL, not an inline form (Page 12 PRD
 * §5.2 gives the explicit reasoning: keeps the list in view, matches Page
 * 11's dialog pattern, avoids the autocomplete dropdown fighting the
 * page's z-index). Renders centered on desktop, full-width bottom sheet
 * on mobile.
 */
export function AddEditReminderDialog({
  editingReminder,
  editingMedicine,
  onClose,
  onSaved,
}: {
  /** null → "Add reminder"; a Reminder → "Edit reminder", pre-filled. */
  editingReminder: Reminder | null;
  /** Only needed when editing, to prefill the medicine picker. */
  editingMedicine: Medicine | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const isOnline = useOnlineStatus();
  const isEditing = editingReminder !== null;

  const [medicine, setMedicine] = useState<Medicine | null>(editingMedicine);
  const [cadence, setCadence] = useState<ReminderCadence>(editingReminder?.cadenceType ?? "one_time");
  const [refillDate, setRefillDate] = useState(
    editingReminder?.cadenceType === "one_time" ? editingReminder.nextDueAt.slice(0, 10) : ""
  );
  const [intervalDays, setIntervalDays] = useState(
    editingReminder?.intervalDays?.toString() ?? DEFAULT_INTERVAL_DAYS.toString()
  );
  const [channel, setChannel] = useState<ReminderChannel>(editingReminder?.channel ?? "push");

  const [medicineError, setMedicineError] = useState<MedicineErrorCode | null>(null);
  const [dateError, setDateError] = useState<DateErrorCode | null>(null);
  const [intervalError, setIntervalError] = useState<IntervalErrorCode | null>(null);
  const [formErrorCode, setFormErrorCode] = useState<FormErrorCode | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerFocusRestoreRef = useRef<Element | null>(null);

  useEffect(() => {
    triggerFocusRestoreRef.current = document.activeElement;
    dialogRef.current?.querySelector<HTMLElement>("input, button")?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (triggerFocusRestoreRef.current instanceof HTMLElement) {
        triggerFocusRestoreRef.current.focus();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const medErr: MedicineErrorCode | null = medicine ? null : "empty";
    const dateErr: DateErrorCode | null = cadence === "one_time" && !refillDate ? "empty" : null;
    const intervalNum = parseInt(intervalDays, 10);
    const intervalErr: IntervalErrorCode | null =
      cadence === "interval" && (!Number.isFinite(intervalNum) || intervalNum < 1) ? "invalid" : null;
    setMedicineError(medErr);
    setDateError(dateErr);
    setIntervalError(intervalErr);
    if (medErr || dateErr || intervalErr || !medicine) return;

    const nextDueAt =
      cadence === "one_time"
        ? new Date(refillDate).toISOString()
        : new Date(Date.now() + intervalNum * DAY_MS).toISOString();

    setFormErrorCode(null);
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateReminder(editingReminder.id, {
          medicineId: medicine.id,
          cadenceType: cadence,
          nextDueAt,
          channel,
          intervalDays: cadence === "interval" ? intervalNum : undefined,
        });
      } else {
        await createReminder({
          medicineId: medicine.id,
          cadenceType: cadence,
          nextDueAt,
          channel,
          intervalDays: cadence === "interval" ? intervalNum : undefined,
        });
      }
      onSaved();
    } catch {
      setFormErrorCode("generic");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isDisabled = isSubmitting || !isOnline;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reminder-dialog-title"
        className="flex max-h-[90vh] w-full flex-col gap-5 overflow-y-auto rounded-t-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-lg sm:max-w-[480px] sm:rounded-[var(--radius-card)] sm:p-[41px]"
      >
        <h2 id="reminder-dialog-title" className="text-xl font-semibold text-[var(--color-text-primary)]">
          {isEditing ? t.reminders.dialogHeadingEdit : t.reminders.dialogHeadingAdd}
        </h2>

        {!isOnline && <Callout variant="error">{t.reminders.offlineBanner}</Callout>}
        {isOnline && formErrorCode && <Callout variant="error">{t.common.errorGeneric}</Callout>}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <MedicinePicker
            selected={medicine}
            onSelect={setMedicine}
            error={medicineError ? t.reminders.validationMedicine : undefined}
          />

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">{t.reminders.cadenceLabel}</span>
            <div className="inline-flex w-full rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-1">
              <button
                type="button"
                onClick={() => setCadence("one_time")}
                className={`flex-1 rounded-[8px] px-3 py-2 text-sm font-medium transition-colors ${
                  cadence === "one_time"
                    ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm"
                    : "text-[var(--color-text-secondary)]"
                }`}
              >
                {t.reminders.cadenceOnce}
              </button>
              <button
                type="button"
                onClick={() => setCadence("interval")}
                className={`flex-1 rounded-[8px] px-3 py-2 text-sm font-medium transition-colors ${
                  cadence === "interval"
                    ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm"
                    : "text-[var(--color-text-secondary)]"
                }`}
              >
                {t.reminders.cadenceRepeating}
              </button>
            </div>
            <p className="text-[13px] text-[var(--color-text-secondary)]">
              {cadence === "one_time" ? t.reminders.cadenceOnceHint : t.reminders.cadenceRepeatingHint}
            </p>
          </div>

          {cadence === "one_time" ? (
            <div className="flex flex-col gap-2">
              <label htmlFor="refill-date" className="text-sm font-medium text-[var(--color-text-primary)]">
                {t.reminders.refillDateLabel}
              </label>
              <input
                id="refill-date"
                type="date"
                min={todayDateInputValue()}
                value={refillDate}
                onChange={(e) => setRefillDate(e.target.value)}
                className={`h-12 w-full rounded-[var(--radius-input)] border bg-[var(--color-surface)] px-[17px] text-base text-[var(--color-text-primary)] outline-none transition-colors focus:ring-2 ${
                  dateError
                    ? "border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/20"
                    : "border-[var(--color-border)] focus:border-[var(--color-focus)] focus:ring-[var(--color-focus)]/25"
                }`}
              />
              {dateError && (
                <p className="text-sm text-[var(--color-error)]" aria-live="polite">
                  {t.reminders.validationDate}
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                {t.reminders.repeatEveryPrefix} {intervalDays || "…"} {t.reminders.repeatEverySuffix}
              </span>
              <input
                type="number"
                min={1}
                inputMode="numeric"
                value={intervalDays}
                onChange={(e) => setIntervalDays(e.target.value)}
                className={`h-12 w-32 rounded-[var(--radius-input)] border bg-[var(--color-surface)] px-[17px] text-base text-[var(--color-text-primary)] outline-none transition-colors focus:ring-2 ${
                  intervalError
                    ? "border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/20"
                    : "border-[var(--color-border)] focus:border-[var(--color-focus)] focus:ring-[var(--color-focus)]/25"
                }`}
              />
              {intervalError && (
                <p className="text-sm text-[var(--color-error)]" aria-live="polite">
                  {t.reminders.validationInterval}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">{t.reminders.channelHeading}</span>
            <div className="flex flex-col gap-2 sm:flex-row">
              <ChannelOption
                selected={channel === "push"}
                onSelect={() => setChannel("push")}
                icon={<BellFilledIcon />}
                label={t.reminders.channelPushOption}
              />
              <ChannelOption
                selected={channel === "sms"}
                onSelect={() => setChannel("sms")}
                icon={<SmsIcon />}
                label={t.reminders.channelSmsOption}
              />
            </div>
          </div>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Button type="submit" disabled={isDisabled} className="flex-1">
              {isSubmitting ? t.profile.saving : t.reminders.saveReminderButton}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting} className="flex-1">
              {t.profile.cancelButton}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ChannelOption({
  selected,
  onSelect,
  icon,
  label,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex flex-1 items-center gap-2 rounded-[var(--radius-input)] border px-4 py-3 text-sm font-medium transition-colors ${
        selected
          ? "border-[var(--color-brand)] bg-[var(--color-stock-in-bg)] text-[var(--color-brand)]"
          : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-canvas)]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
