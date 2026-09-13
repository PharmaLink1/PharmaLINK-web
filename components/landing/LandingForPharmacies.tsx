"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { StockCheckIcon } from "@/components/ui/icons";

/**
 * No Figma frame was provided for this section either — same rationale as
 * LandingHowItWorks. Kept visually distinct (tinted band, outline CTA) from
 * the patient-facing sections per Page 10's PRD so it never competes with
 * the hero search for attention.
 */
export function LandingForPharmacies() {
  const { t } = useTranslation();

  const bullets = [t.landing.pharmaciesBullet1, t.landing.pharmaciesBullet2, t.landing.pharmaciesBullet3];

  return (
    <section id="for-pharmacies" className="w-full bg-[var(--color-brand)]/[0.06] py-16 sm:py-20">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-8 px-[24px] text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
        <div className="flex max-w-xl flex-col items-center gap-4 lg:items-start">
          <span className="text-sm font-semibold text-[var(--color-brand)]">{t.landing.pharmaciesEyebrow}</span>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] sm:text-[30px]">{t.landing.pharmaciesTitle}</h2>
          <p className="text-[15px] leading-6 text-[var(--color-text-secondary)]">{t.landing.pharmaciesBody}</p>
          <ul className="flex flex-col items-center gap-2 lg:items-start">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-center gap-2 text-[15px] text-[var(--color-text-primary)]">
                <StockCheckIcon className="shrink-0 text-[var(--color-brand)]" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col items-center gap-3 lg:items-start">
          <Link
            href="/signup/pharmacy"
            className="inline-flex h-12 items-center justify-center rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-base font-semibold text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-canvas)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]/40"
          >
            {t.landing.pharmaciesCta}
          </Link>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {t.landing.pharmaciesAlreadyRegistered}{" "}
            <Link href="/login" className="font-medium text-[var(--color-brand)] hover:underline">
              {t.landing.navLogIn}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
