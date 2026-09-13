"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";

/**
 * Shared footer for every public page — landing, and now the registration
 * pages too. Originally built for the landing page (Figma node 17:1083),
 * promoted alongside PublicHeader once a second page needed it.
 */
export function PublicFooter() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-[var(--color-border)] bg-[var(--color-surface-muted)]">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-[24px] py-12 lg:flex-row lg:justify-between">
        <div className="flex flex-col gap-2 lg:max-w-sm">
          <span className="text-2xl font-bold text-[var(--color-brand)]">{t.landing.footerColumnBrandHeading}</span>
          <p className="max-w-sm text-[13px] leading-[18px] text-[var(--color-text-secondary)]">
            {t.landing.footerDisclaimer}
          </p>
          <p className="text-[13px] text-[var(--color-text-secondary)]">
            © {year} {t.landing.footerRightsReserved}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-base font-semibold text-[var(--color-text-primary)]">{t.landing.footerColumnBrandHeading}</span>
          <a href="#" className="text-base text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
            {t.landing.footerAboutUs}
          </a>
          <a href="#" className="text-base text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
            {t.landing.footerContact}
          </a>
          <a href="#" className="text-base text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
            {t.landing.footerHelpCenter}
          </a>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-base font-semibold text-[var(--color-text-primary)]">{t.landing.footerColumnLegalHeading}</span>
          <a href="#" className="text-base text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
            {t.landing.footerPrivacyPolicy}
          </a>
          <a href="#" className="text-base text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
            {t.landing.footerTermsOfService}
          </a>
        </div>
      </div>
    </footer>
  );
}
