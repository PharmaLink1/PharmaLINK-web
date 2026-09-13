"use client";

import { Bell, BellOff } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/button";

/** Per-medicine back-in-stock alert toggle. State is owned by the container (a
 * Map<medicine_id, subscription_id>); this is purely presentational. */
export function NotifyButton({
  subscribed,
  pending,
  error,
  onToggle,
  t,
}: {
  subscribed: boolean;
  pending: boolean;
  error?: string;
  onToggle: () => void;
  t: Dictionary;
}) {
  const notify = t.dashboard.search.notify;
  const label = pending
    ? subscribed
      ? notify.canceling
      : notify.subscribing
    : subscribed
      ? notify.cancel
      : notify.subscribe;

  return (
    <div className={"flex flex-col items-start gap-1"}>
      <Button
        type={"button"}
        variant={subscribed ? "secondary" : "outline"}
        size={"sm"}
        loading={pending}
        onClick={onToggle}
      >
        {!pending &&
          (subscribed ? (
            <BellOff className={"size-4"} aria-hidden />
          ) : (
            <Bell className={"size-4"} aria-hidden />
          ))}
        {label}
      </Button>
      {subscribed && !pending && !error ? (
        <span className={"text-xs text-success"}>{notify.subscribed}</span>
      ) : null}
      {error ? (
        <span role={"alert"} className={"text-xs font-medium text-danger"}>
          {error}
        </span>
      ) : null}
    </div>
  );
}
