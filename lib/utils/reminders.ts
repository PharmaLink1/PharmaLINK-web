import type { Reminder } from "@/lib/types/reminder";
import type { Dictionary } from "@/lib/i18n/en";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole calendar days between now and an ISO date — negative when overdue. */
function daysUntil(iso: string, now = new Date()): number {
  const due = new Date(iso);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  return Math.round((startOfDue.getTime() - startOfToday.getTime()) / DAY_MS);
}

/** "Oct 14, 2026" — used for far-future one-time dates only (§10's example). */
export function formatFarDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export interface DueDescriptor {
  /** The primary due line, e.g. "Due in 3 days" / "Every 30 days". */
  primary: string;
  /** The secondary relative line — only set for interval reminders, per
   * PRD §1 item 4 ("Every {N} days" + a separate "Next due in {N} days"). */
  secondary?: string;
  isOverdue: boolean;
}

/**
 * Composes the plain-language due line for a reminder row (Page 12 PRD
 * §1 item 4, §10). Numbers/dates are concatenated around static translated
 * fragments rather than passed through string interpolation, since the
 * i18n dictionary has none — same precedent as Page 5's resend countdown.
 */
export function describeDue(reminder: Reminder, t: Dictionary["reminders"]): DueDescriptor {
  const diff = daysUntil(reminder.nextDueAt);
  const isOverdue = diff < 0;

  if (reminder.cadenceType === "interval") {
    const cadence = `${t.everyDaysPrefix}${reminder.intervalDays ?? "?"}${t.everyDaysSuffix}`;
    const nextDue =
      diff < 0
        ? `${t.overdueByPrefix}${Math.abs(diff)}${t.overdueBySuffix}`
        : diff === 0
          ? t.nextDueToday
          : `${t.nextDueInDaysPrefix}${diff}${t.nextDueInDaysSuffix}`;
    return { primary: cadence, secondary: nextDue, isOverdue };
  }

  // one_time: relative phrasing within a week either side, else the actual date.
  if (diff < 0) {
    return { primary: `${t.overdueByPrefix}${Math.abs(diff)}${t.overdueBySuffix}`, isOverdue: true };
  }
  if (diff === 0) {
    return { primary: t.dueToday, isOverdue: false };
  }
  if (diff <= 7) {
    return { primary: `${t.dueInDaysPrefix}${diff}${t.dueInDaysSuffix}`, isOverdue: false };
  }
  return { primary: `${t.oneTimeOnPrefix}${formatFarDate(reminder.nextDueAt)}${t.oneTimeOnSuffix}`, isOverdue: false };
}

/** Soonest-due-first — overdue reminders naturally sort to the top, most
 * overdue first, since their nextDueAt is furthest in the past (PRD §1). */
export function sortByDueDate(reminders: Reminder[]): Reminder[] {
  return [...reminders].sort(
    (a, b) => new Date(a.nextDueAt).getTime() - new Date(b.nextDueAt).getTime()
  );
}
