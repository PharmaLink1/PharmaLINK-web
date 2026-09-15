// Reminder contract types (source of truth: /c/Code/development/PharmaLINK-backend,
// internal/reminder/dto plus the status, channel and weekday constants in
// internal/reminder/domain/entity.go). The write side is camelCase; the read side
// returns only the fields mirrored below.

/** Cadence types the backend accepts; anything else fails with INVALID_CADENCE. */
export type CadenceType = "daily" | "weekly" | "custom";

/** Lifecycle statuses from the backend's enum. The scheduler writes active and
 * paused; completed and cancelled are reachable through the API. */
export type ReminderStatus = "active" | "paused" | "completed" | "cancelled";

/** Weekday codes accepted in a weekly cadence rule. */
export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

/** The weekdays in the order the backend numbers them, for the day picker. */
export const WEEKDAYS: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

/**
 * Parameters of a cadence. Which fields matter depends on its type: "daily" reads
 * intervalHours (1-24), "weekly" reads days plus timeOfDay (default "08:00"), and
 * "custom" reads timesOfDay. Every clock time is UTC on the wire.
 */
export type CadenceRule = {
  intervalHours?: number;
  days?: Weekday[];
  timeOfDay?: string;
  timesOfDay?: string[];
};

/**
 * Body for POST /reminders. No channel is sent: the backend defaults it to push, and
 * its scheduler does not deliver SMS yet, so offering the choice would be a lie.
 */
export type CreateReminderRequest = {
  medicine: string;
  cadenceType: CadenceType;
  cadenceRule: CadenceRule;
};

/**
 * Body for PATCH /reminders/{id}. An absent field keeps its stored value, and
 * cadenceRule is replaced as a whole rather than merged. A patch accepts only
 * active or paused for status; cancelling goes through DELETE.
 */
export type UpdateReminderRequest = {
  medicine?: string;
  cadenceType?: CadenceType;
  cadenceRule?: CadenceRule;
  status?: "active" | "paused";
};

/** Data from POST /reminders and PATCH /reminders/{id}. */
export type ReminderDetail = {
  id: string;
  medicine: string;
  nextDueAt: string;
  channel: string;
  status: ReminderStatus;
};

/**
 * One entry of GET /reminders. The cadence is not part of this response, so a stored
 * reminder can be paused, resumed or cancelled from the list but not rescheduled.
 */
export type ReminderListItem = {
  id: string;
  medicine: string;
  nextDueAt: string;
  status: ReminderStatus;
};
