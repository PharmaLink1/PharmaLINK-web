"use client";

import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { BackArrowIcon, PlusIcon } from "@/components/ui/icons";
import { useTranslation } from "@/lib/i18n/useTranslation";

/**
 * Page 5, Screen A — "Forgot Password". Same card shell/treatment as
 * Login (app/(auth)/login/page.tsx) per PRD §3 — reusing it directly
 * rather than re-deriving the spacing/tokens from scratch.
 */
export default function ForgotPasswordPage() {
  const { t } = useTranslation();

  return (
    <main className="flex flex-1 flex-col items-center bg-[var(--color-canvas)] px-5 pb-6 sm:px-6 sm:pb-10">
      <div className="mt-6 w-full max-w-[520px] sm:mt-8 sm:rounded-[var(--radius-card)] sm:border sm:border-[var(--color-border)] sm:bg-[var(--color-surface)] sm:p-[41px]">
        <Link
          href="/login"
          aria-label={t.common.back}
          className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-canvas)]"
        >
          <BackArrowIcon />
        </Link>

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
              {t.forgotPassword.titleScreenA}
            </h1>
            <p className="text-[15px] leading-[22px] text-[var(--color-text-secondary)]">
              {t.forgotPassword.instructionScreenA}
            </p>
          </div>
        </div>

        <div className="mt-6 w-full">
          <ForgotPasswordForm />
        </div>
      </div>

      <div className="w-full max-w-[520px]">
        <AuthFooter />
      </div>
    </main>
  );
}
