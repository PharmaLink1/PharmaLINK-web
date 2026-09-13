import type { ReminderChannel } from "@/lib/types/reminder";
import { BellFilledIcon, SmsIcon } from "@/components/ui/icons";
import { useTranslation } from "@/lib/i18n/useTranslation";

/**
 * Channel pill — icon + label, never icon-only (Page 12 PRD §4/§8). Push
 * and SMS get their own tint (push reuses the existing stock-in/brand
 * green — "in stock" already reads as a positive, active color; SMS gets
 * a new dedicated blue, §3 in globals.css) instead of both sharing one
 * flat gray pill, so the two channels are distinguishable at a glance.
 */
export function ChannelPill({ channel }: { channel: ReminderChannel }) {
  const { t } = useTranslation();
  const isPush = channel === "push";

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-[9px] py-[3px] text-xs font-medium"
      style={
        isPush
          ? {
              backgroundColor: "var(--color-stock-in-bg)",
              borderColor: "var(--color-stock-in-border)",
              color: "var(--color-brand)",
            }
          : {
              backgroundColor: "var(--color-accent-info-bg)",
              borderColor: "var(--color-accent-info-border)",
              color: "var(--color-accent-info)",
            }
      }
    >
      {isPush ? <BellFilledIcon /> : <SmsIcon />}
      {isPush ? t.reminders.channelPush : t.reminders.channelSms}
    </span>
  );
}
