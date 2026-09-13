"use client";

import { useRouter } from "next/navigation";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { PlusIcon } from "@/components/ui/icons";
import { useTranslation } from "@/lib/i18n/useTranslation";

/**
 * Page 5, Screen B — "Set New Password". Same card shell as Screen A, but
 * with a plain "Cancel" text link instead of a back arrow (PRD §1 Screen
 * B, §8) — an explicit, honest exit mid-reset rather than an ambiguous
 * "back" that might look like it saves progress.
 */
export function ResetPasswordScreen({ resetToken }: { resetToken: string }) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <main className="flex flex-1 flex-col items-center bg-[var(--color-canvas)] px-5 pb-6 sm:px-6 sm:pb-10">
      <div className="mt-6 w-full max-w-[520px] sm:mt-8 sm:rounded-[var(--radius-card)] sm:border sm:border-[var(--color-border)] sm:bg-[var(--color-surface)] sm:p-[41px]">
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="mb-4 text-[15px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        >
          {t.forgotPassword.cancelLink}
        </button>

        <div className="flex w-full flex-col">
          <div className="mb-6 flex w-full items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] bg-[var(--color-brand)] shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
              <PlusIcon />
            </span>
            <span className="text-[26px] leading-8 font-bold text-[var(--color-text-primary)]">
              {t.common.appName}
            </span>
          </div>
          <div className="flex w-full flex-col gap-2">
            <h1 className="text-[26px] leading-8 font-bold text-[var(--color-text-primary)]">
              {t.forgotPassword.titleScreenB}
            </h1>
            <p className="text-[15px] leading-[22px] text-[var(--color-text-secondary)]">
              {t.forgotPassword.instructionScreenB}
            </p>
          </div>
        </div>

        <div className="mt-6 w-full">
          <ResetPasswordForm resetToken={resetToken} />
        </div>
      </div>

      <div className="w-full max-w-[520px]">
        <AuthFooter />
      </div>
    </main>
  );
}
