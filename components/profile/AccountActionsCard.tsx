import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { LogoutButton } from "@/components/profile/LogoutButton";

/**
 * Card 4 — Account actions, extracted from the Figma frame (node 45:1259,
 * "Section - 4. Account Actions"): the Change-password row above the
 * (non-red, secondary-styled) Log out button.
 */
export function AccountActionsCard() {
  return (
    <div className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-[41px]">
      <ChangePasswordForm />
      <LogoutButton />
    </div>
  );
}
