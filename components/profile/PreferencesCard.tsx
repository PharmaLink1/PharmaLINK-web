"use client";

import { LanguagePill } from "@/components/ui/LanguagePill";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";
import { useTranslation } from "@/lib/i18n/useTranslation";

/**
 * Card 3 — Preferences, extracted from the Figma frame (node 45:1259,
 * "Section - 3. Preferences"). Deliberately does NOT rebuild the language/
 * theme controls — it embeds the exact same global LanguagePill/ThemeToggle
 * components used in the nav, so there's exactly one source of truth for
 * each choice (Page 11 PRD §1 card 3, §9).
 */
export function PreferencesCard() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { theme } = useTheme();

  const languageValue = language === "en" ? "English" : "አማርኛ";
  const themeValue = theme === "dark" ? t.profile.themeDark : t.profile.themeLight;

  return (
    <div className="flex flex-col gap-6 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-[41px]">
      <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">{t.profile.preferencesHeading}</h2>

      <div className="flex flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] py-4">
          <div>
            <p className="text-base text-[var(--color-text-primary)]">{t.profile.languageLabel}</p>
            <p className="text-[13px] text-[var(--color-text-secondary)]">{languageValue}</p>
          </div>
          <LanguagePill />
        </div>

        <div className="flex items-center justify-between gap-4 py-4">
          <div>
            <p className="text-base text-[var(--color-text-primary)]">{t.profile.themeLabel}</p>
            <p className="text-[13px] text-[var(--color-text-secondary)]">{themeValue}</p>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
