import { apiRequest } from "@/lib/api/client";
import type { CreateReminderPayload, Reminder, UpdateReminderPayload } from "@/lib/types/reminder";

export type {
  Reminder,
  ReminderCadence,
  ReminderChannel,
  ReminderStatus,
  CreateReminderPayload,
  UpdateReminderPayload,
} from "@/lib/types/reminder";

const USE_MOCKS = true;

/**
 * Real mock persistence (Page 12 — Reminders PRD §11, flagged problem 1).
 * Previously createReminder() fabricated a Reminder but never stored it,
 * and listReminders() unconditionally returned [] — the list was
 * permanently empty in dev. Same guarded localStorage pattern as
 * hooks/useRecentSearches.ts, not a new one.
 */
const STORAGE_KEY = "pharmalink_reminders";
const MOCK_USER_ID = "mock_user";

function readStoredReminders(): Reminder[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as Reminder[]) : [];
  } catch {
    return [];
  }
}

function writeStoredReminders(reminders: Reminder[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export async function createReminder(payload: CreateReminderPayload): Promise<Reminder> {
  if (USE_MOCKS) {
    const reminder: Reminder = {
      id: `reminder_${Date.now()}`,
      userId: MOCK_USER_ID,
      status: "active",
      ...payload,
    };
    const all = readStoredReminders();
    all.push(reminder);
    writeStoredReminders(all);
    return reminder;
  }
  return apiRequest<Reminder>("/reminders", { method: "POST", body: payload });
}

export async function listReminders(): Promise<Reminder[]> {
  if (USE_MOCKS) {
    return readStoredReminders().filter((r) => r.status !== "cancelled");
  }
  return apiRequest<Reminder[]>("/reminders");
}

export async function updateReminder(id: string, payload: UpdateReminderPayload): Promise<Reminder> {
  if (USE_MOCKS) {
    const all = readStoredReminders();
    const index = all.findIndex((r) => r.id === id);
    if (index === -1) throw new Error("Reminder not found.");
    const updated: Reminder = { ...all[index], ...payload };
    all[index] = updated;
    writeStoredReminders(all);
    return updated;
  }
  return apiRequest<Reminder>(`/reminders/${id}`, { method: "PATCH", body: payload });
}

/** Fixed +1 day snooze (Page 12 PRD §5.4 — a product decision, flagged as
 * MVP default there, not a permanent constraint). */
export async function snoozeReminder(id: string): Promise<Reminder> {
  if (USE_MOCKS) {
    const all = readStoredReminders();
    const index = all.findIndex((r) => r.id === id);
    if (index === -1) throw new Error("Reminder not found.");
    const current = all[index];
    const updated: Reminder = {
      ...current,
      status: "snoozed",
      nextDueAt: new Date(new Date(current.nextDueAt).getTime() + ONE_DAY_MS).toISOString(),
    };
    all[index] = updated;
    writeStoredReminders(all);
    return updated;
  }
  return apiRequest<Reminder>(`/reminders/${id}/snooze`, { method: "POST" });
}

export async function cancelReminder(id: string): Promise<void> {
  if (USE_MOCKS) {
    const all = readStoredReminders();
    const index = all.findIndex((r) => r.id === id);
    if (index === -1) return;
    all[index] = { ...all[index], status: "cancelled" };
    writeStoredReminders(all);
    return;
  }
  return apiRequest<void>(`/reminders/${id}`, { method: "DELETE" });
}
