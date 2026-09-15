"use client";

import * as React from "react";
import { AlarmClock, Plus } from "lucide-react";
import { reminderApi } from "@/lib/api-client";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { ReminderListItem, ReminderStatus } from "@/lib/reminder-types";
import { useLanguage } from "@/lib/i18n";
import { getErrorMessage } from "@/lib/i18n/errors";
import { formatDueAt, isDueNow } from "@/lib/reminder-format";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { AppHeader } from "@/components/layout/app-header";
import { ReminderForm } from "@/components/dashboard/reminders/reminder-form";
import { cn } from "@/lib/cn";

type Phase = "loading" | "ready" | "error";

const statusPillClasses: Record<ReminderStatus, string> = {
  active: "bg-success-subtle text-success",
  paused: "bg-warning-subtle text-warning",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-danger-subtle text-danger",
};

/**
 * The patient's reminders (GET/POST/PATCH/DELETE /reminders). The list response
 * carries no cadence, so a stored reminder can be paused, resumed or cancelled here
 * but its schedule can only be set at creation.
 */
export function RemindersContent() {
  const { t } = useLanguage();
  const r = t.dashboard.reminders;

  const [phase, setPhase] = React.useState<Phase>("loading");
  const [reminders, setReminders] = React.useState<ReminderListItem[]>([]);
  const [error, setError] = React.useState("");
  const [formOpen, setFormOpen] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [confirmId, setConfirmId] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState("");

  const load = React.useCallback(async () => {
    setPhase("loading");
    setError("");
    try {
      setReminders(await reminderApi.list());
      setPhase("ready");
    } catch (err) {
      setError(getErrorMessage(err, t));
      setPhase("error");
    }
  }, [t]);

  React.useEffect(() => {
    // Defer off the synchronous effect path so the first fetch does not cascade a
    // render, the same way lib/auth-context hydrates the session.
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  // The list arrives soonest due first, so keep that order locally rather than
  // paying for a refetch the patient has to wait on.
  function byNextDue(items: ReminderListItem[]) {
    return [...items].sort((a, b) => a.nextDueAt.localeCompare(b.nextDueAt));
  }

  function addCreated(created: ReminderListItem) {
    setReminders((prev) => byNextDue([...prev, created]));
    setFormOpen(false);
  }

  async function togglePaused(reminder: ReminderListItem) {
    if (busyId) return;
    setBusyId(reminder.id);
    setActionError("");
    try {
      const updated = await reminderApi.update(reminder.id, {
        status: reminder.status === "paused" ? "active" : "paused",
      });
      const next: ReminderListItem = {
        id: updated.id,
        medicine: updated.medicine,
        nextDueAt: updated.nextDueAt,
        status: updated.status,
      };
      setReminders((prev) => byNextDue(prev.map((item) => (item.id === next.id ? next : item))));
    } catch (err) {
      setActionError(getErrorMessage(err, t));
    } finally {
      setBusyId(null);
    }
  }

  async function cancelReminder(id: string) {
    if (busyId) return;
    setBusyId(id);
    setActionError("");
    try {
      await reminderApi.cancel(id);
      setReminders((prev) => prev.filter((item) => item.id !== id));
      setConfirmId(null);
    } catch (err) {
      setActionError(getErrorMessage(err, t));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className={"flex min-h-dvh flex-col"}>
      <AppHeader />

      <main className={"mx-auto w-full max-w-3xl flex-1 px-6 py-10"}>
        <header className={"flex flex-wrap items-start justify-between gap-4"}>
          <div>
            <h1 className={"text-2xl font-semibold tracking-tight"}>{r.title}</h1>
            <p className={"mt-1 text-muted-foreground"}>{r.subtitle}</p>
          </div>
          {!formOpen && phase === "ready" && (
            <Button type={"button"} size={"sm"} onClick={() => setFormOpen(true)}>
              <Plus className={"size-4"} aria-hidden />
              {r.newReminder}
            </Button>
          )}
        </header>

        {formOpen && <ReminderForm onCreated={addCreated} onClose={() => setFormOpen(false)} />}

        {actionError && (
          <div className={"mt-6"}>
            <Alert variant={"danger"}>{actionError}</Alert>
          </div>
        )}

        {phase === "loading" && (
          <div className={"mt-12 flex justify-center"}>
            <Spinner label={r.loading} />
          </div>
        )}

        {phase === "error" && (
          <div className={"mt-6"}>
            <Alert variant={"danger"}>
              <div className={"flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"}>
                <span>{error}</span>
                <Button type={"button"} variant={"outline"} size={"sm"} onClick={() => void load()}>
                  {r.retry}
                </Button>
              </div>
            </Alert>
          </div>
        )}

        {phase === "ready" && reminders.length === 0 && !formOpen && (
          <Card className={"mt-8 flex flex-col items-center gap-3 p-8 text-center"}>
            <span className={"flex size-12 items-center justify-center rounded-full bg-primary-subtle text-primary-strong"}>
              <AlarmClock className={"size-6"} aria-hidden />
            </span>
            <h2 className={"font-semibold"}>{r.emptyTitle}</h2>
            <p className={"max-w-sm text-sm text-muted-foreground"}>{r.emptyBody}</p>
            <Button type={"button"} size={"sm"} className={"mt-1"} onClick={() => setFormOpen(true)}>
              <Plus className={"size-4"} aria-hidden />
              {r.newReminder}
            </Button>
          </Card>
        )}

        {phase === "ready" && reminders.length > 0 && (
          <ul className={"mt-8 space-y-3"}>
            {reminders.map((reminder) => (
              <ReminderRow
                key={reminder.id}
                reminder={reminder}
                busy={busyId === reminder.id}
                confirming={confirmId === reminder.id}
                onTogglePaused={() => void togglePaused(reminder)}
                onAskCancel={() => setConfirmId(reminder.id)}
                onKeep={() => setConfirmId(null)}
                onConfirmCancel={() => void cancelReminder(reminder.id)}
                t={t}
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function ReminderRow({
  reminder,
  busy,
  confirming,
  onTogglePaused,
  onAskCancel,
  onKeep,
  onConfirmCancel,
  t,
}: {
  reminder: ReminderListItem;
  busy: boolean;
  confirming: boolean;
  onTogglePaused: () => void;
  onAskCancel: () => void;
  onKeep: () => void;
  onConfirmCancel: () => void;
  t: Dictionary;
}) {
  const { locale } = useLanguage();
  const r = t.dashboard.reminders;
  const paused = reminder.status === "paused";

  return (
    <li>
      <Card className={"flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"}>
        <div className={"min-w-0"}>
          <div className={"flex flex-wrap items-center gap-2"}>
            <p className={"truncate font-medium text-foreground"}>{reminder.medicine}</p>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                statusPillClasses[reminder.status],
              )}
            >
              {r.status[reminder.status]}
            </span>
          </div>
          <p className={"mt-1 text-xs text-muted-foreground"}>
            {r.nextDue}{" "}
            <span className={"tabular-nums"}>
              {isDueNow(reminder.nextDueAt) ? r.dueNow : formatDueAt(reminder.nextDueAt, locale)}
            </span>
          </p>
        </div>

        {confirming ? (
          <div className={"flex flex-col gap-2 sm:items-end"}>
            <p className={"text-sm font-medium text-foreground"}>{r.confirmTitle}</p>
            <p className={"text-xs text-muted-foreground"}>{r.confirmBody}</p>
            <div className={"flex flex-col gap-2 sm:flex-row"}>
              <Button
                type={"button"}
                variant={"destructive"}
                size={"sm"}
                block
                className={"sm:w-auto"}
                loading={busy}
                onClick={onConfirmCancel}
              >
                {r.confirmYes}
              </Button>
              <Button
                type={"button"}
                variant={"outline"}
                size={"sm"}
                block
                className={"sm:w-auto"}
                disabled={busy}
                onClick={onKeep}
              >
                {r.confirmNo}
              </Button>
            </div>
          </div>
        ) : (
          <div className={"flex flex-col gap-2 sm:flex-row sm:shrink-0"}>
            <Button
              type={"button"}
              variant={"outline"}
              size={"sm"}
              block
              className={"sm:w-auto"}
              loading={busy}
              onClick={onTogglePaused}
            >
              {paused ? r.resume : r.pause}
            </Button>
            <Button
              type={"button"}
              variant={"ghost"}
              size={"sm"}
              block
              className={"text-muted-foreground hover:text-danger sm:w-auto"}
              disabled={busy}
              onClick={onAskCancel}
            >
              {r.cancelReminder}
            </Button>
          </div>
        )}
      </Card>
    </li>
  );
}
