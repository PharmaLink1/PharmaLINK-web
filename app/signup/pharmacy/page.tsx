"use client";

import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { RoleChip } from "@/components/auth/RoleChip";
import { PharmacyRegistrationForm } from "@/components/auth/PharmacyRegistrationForm";
import { BackArrowIcon, PharmacyStorefrontIcon, ShieldIcon } from "@/components/ui/icons";
import { useTranslation } from "@/lib/i18n/useTranslation";

/**
 * Page 4 — Pharmacy Staff Registration. Extracted from Figma nodes 6:213
 * (left photo pane, desktop only — no overlay/tagline, unlike Page 3) and
 * 6:215 (right form pane). Same "vibe" as Page 3 per request: public
 * header/footer + two-pane brand-photo layout, so it lives at the
 * top-level (not under (auth)) for the same reason Patient Registration
 * does — PublicHeader already carries the theme toggle + language pill.
 */
export default function PharmacyRegistrationPage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />

      <main className="flex flex-1 flex-col lg:flex-row">
        <AuthBrandPanel imageSrc="/pharma2.png" appName={t.common.appName} />

        <div className="flex flex-1 flex-col items-center justify-center bg-[var(--color-canvas)] px-5 py-10 sm:px-6 lg:px-12">
          <div className="w-full max-w-[540px] sm:rounded-[var(--radius-card)] sm:border sm:border-[var(--color-border)] sm:bg-[var(--color-surface)] sm:p-8">
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
              <h1 className="text-[26px] leading-8 font-bold text-[var(--color-text-primary)]">
                {t.signup.pharmacyPageTitle}
              </h1>
              <p className="text-base leading-6 text-[var(--color-text-secondary)]">
                {t.signup.pharmacyPageSubtitle}
              </p>
            </div>

            <div className="mt-6">
              <RoleChip
                icon={<PharmacyStorefrontIcon />}
                label={t.signup.roleChipPharmacy}
                changeLabel={t.signup.changeRole}
              />
            </div>

            <div className="mt-6">
              <PharmacyRegistrationForm />
            </div>

            <p className="mt-8 flex items-center justify-center gap-2 border-t border-[var(--color-border)] pt-6 text-[13px] leading-[18px] text-[var(--color-text-secondary)]">
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
