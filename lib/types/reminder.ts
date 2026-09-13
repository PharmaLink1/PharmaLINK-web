export type ReminderCadence = "one_time" | "interval";
export type ReminderChannel = "push" | "sms";
export type ReminderStatus = "active" | "snoozed" | "cancelled";

export interface Reminder {
  id: string;
  userId: string;
  medicineId: string;
  cadenceType: ReminderCadence;
  nextDueAt: string;
  channel: ReminderChannel;
  status: ReminderStatus;
  /**
   * NEW field (Page 12 — Reminders PRD §11, data-model gap #2). Required
   * when cadenceType is "interval", null/undefined for "one_time". Without
   * it, neither the UI nor the backend has any way to know "every how many
   * days" — nextDueAt alone can't answer that once the current cycle
   * completes. Not in prd.md §8's Reminder row yet — flagged there too.
   */
  intervalDays?: number;
}

export interface CreateReminderPayload {
  medicineId: string;
  cadenceType: ReminderCadence;
  nextDueAt: string;
  channel: ReminderChannel;
  intervalDays?: number;
}

export type UpdateReminderPayload = Partial<CreateReminderPayload>;
