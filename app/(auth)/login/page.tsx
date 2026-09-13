"use client";

import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { BackArrowIcon, PlusIcon, ShieldIcon } from "@/components/ui/icons";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function LoginPage() {
  const { t } = useTranslation();

  return (
    <main className="flex flex-1 flex-col items-center bg-[var(--color-canvas)] px-5 pb-6 sm:px-6 sm:pb-10">
      <div className="mt-6 w-full max-w-[520px] sm:mt-8 sm:rounded-[var(--radius-card)] sm:border sm:border-[var(--color-border)] sm:bg-[var(--color-surface)] sm:p-[41px]">
        <Link
          href="/"
          aria-label={t.common.back}
          className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-canvas)]"
        >
          <BackArrowIcon />
        </Link>

        {/* Header: logo + brand, then welcome heading + subtitle */}
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
              {t.auth.title}
            </h1>
            <p className="text-base leading-6 text-[var(--color-text-secondary)]">{t.auth.subtitle}</p>
          </div>
        </div>

        <div className="mt-6 w-full">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-base text-[var(--color-text-secondary)]">
          {t.auth.noAccount}{" "}
          <Link href="/signup" className="text-[15px] font-medium text-[var(--color-brand)] hover:underline">
            {t.auth.signUp}
          </Link>
        </p>

        <p className="mt-8 flex items-center justify-center gap-2 text-[13px] leading-[18px] text-[var(--color-text-secondary)]">
          <ShieldIcon />
          {t.auth.trustLine}
        </p>
      </div>
    </main>
  );
}
