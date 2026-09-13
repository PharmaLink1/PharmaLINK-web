"use client";

import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { RoleChip } from "@/components/auth/RoleChip";
import { PatientRegistrationForm } from "@/components/auth/PatientRegistrationForm";
import { BackArrowIcon, PersonIcon, ShieldIcon } from "@/components/ui/icons";
import { useTranslation } from "@/lib/i18n/useTranslation";

/**
 * Page 3 — Patient Registration. Extracted from Figma nodes 6:121 (left
 * brand image pane, desktop only) and 6:134 (right form pane).
 *
 * Deliberately moved OUT of the (auth) route group (unlike Login and Role
 * Selection, which stay under it with their suppressed navbar per Figma).
 * This page carries the full public header/footer instead — same reasoning
 * as moving /search out of (patient): reusing the shared layout's toggle
 * row here would duplicate PublicHeader's own theme toggle + language pill.
 */
export default function PatientRegistrationPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />

      <main className="flex flex-1 flex-col lg:flex-row">
        <AuthBrandPanel imageSrc="/pharma1.png" appName={t.common.appName} tagline={t.signup.brandTagline} />

        <div className="flex flex-1 flex-col items-center justify-center bg-[var(--color-canvas)] px-5 py-10 sm:px-6 lg:px-12">
          <div className="w-full max-w-[500px] sm:rounded-[var(--radius-card)] sm:border sm:border-[var(--color-border)] sm:bg-[var(--color-surface)] sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <Link
                href="/signup"
                aria-label={t.common.back}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-canvas)]"
              >
                <BackArrowIcon />
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="text-[26px] leading-8 font-bold text-[var(--color-text-primary)]">{t.signup.title}</h1>
              <p className="text-base leading-6 text-[var(--color-text-secondary)]">{t.signup.subtitle}</p>
            </div>

            <div className="mt-6">
              <RoleChip icon={<PersonIcon />} label={t.signup.roleChipPatient} changeLabel={t.signup.changeRole} />
            </div>

            <div className="mt-4">
              <PatientRegistrationForm />
            </div>

            <p className="mt-8 flex items-center justify-center gap-2 text-[13px] leading-[18px] text-[var(--color-text-secondary)]">
              <ShieldIcon />
              {t.signup.trustLine}
            </p>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
