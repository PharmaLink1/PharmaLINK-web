"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";

/**
 * Compact footer for Page 5's two screens — extracted from the reference
 * screenshot behind Figma node 42:1138 (PRD §1/§3): a centered link row +
 * a one-line security tagline, below the card. Login/Signup don't have
 * this yet — deliberately scoped to Forgot Password for now rather than
 * silently rolled out everywhere (PRD §4 flags this as an open decision).
 */
export function AuthFooter() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 flex flex-col items-center gap-2 pb-8 text-center">
      <nav className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
        <a href="/privacy" className="hover:text-[var(--color-text-primary)] hover:underline">
          {t.forgotPassword.footerLinkPrivacy}
        </a>
        <a href="/terms" className="hover:text-[var(--color-text-primary)] hover:underline">
          {t.forgotPassword.footerLinkTerms}
        </a>
        <a href="/help" className="hover:text-[var(--color-text-primary)] hover:underline">
          {t.forgotPassword.footerLinkHelp}
        </a>
      </nav>
      <p className="text-[13px] text-[var(--color-text-secondary)]">
        © {year} {t.forgotPassword.footerTagline}
      </p>
    </footer>
  );
}
