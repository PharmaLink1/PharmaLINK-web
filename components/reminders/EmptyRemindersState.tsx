import { BellFilledIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n/useTranslation";

/**
 * No reminders yet (Page 12 PRD §1 item 7) — includes its own "Add
 * reminder" button so the first reminder is addable directly here, not a
 * dead end waiting on Drug Info (Page 9), which doesn't exist yet.
 */
export function EmptyRemindersState({ onAdd }: { onAdd: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]">
        <BellFilledIcon className="h-6 w-6" />
      </span>
      <p className="text-lg font-semibold text-[var(--color-text-primary)]">{t.reminders.emptyHeading}</p>
      <p className="max-w-sm text-sm text-[var(--color-text-secondary)]">{t.reminders.emptyBody}</p>
      <Button type="button" onClick={onAdd} className="mt-2">
        {t.reminders.addReminderButton}
      </Button>
    </div>
  );
}
