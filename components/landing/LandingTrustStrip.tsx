"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";
import { ClockIcon, DrugInfoIcon, GlobeFilledIcon, PriceTagIcon } from "@/components/ui/icons";

/** Extracted from Figma node 17:975, "Section - Trust Strip". */
export function LandingTrustStrip() {
  const { t } = useTranslation();

  const items = [
    { icon: ClockIcon, label: t.landing.trustStrip1 },
    { icon: PriceTagIcon, label: t.landing.trustStrip2 },
    { icon: DrugInfoIcon, label: t.landing.trustStrip3 },
    { icon: GlobeFilledIcon, label: t.landing.trustStrip4 },
  ];

  return (
    <div className="w-full border-y border-[var(--color-border)] bg-[var(--color-surface-muted)] py-4">
      <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center justify-center gap-x-8 gap-y-3 px-[24px] lg:flex-nowrap lg:justify-between">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2">
            <Icon className="shrink-0 text-[var(--color-text-secondary)]" />
            <span className="text-[13px] whitespace-nowrap text-[var(--color-text-secondary)]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
