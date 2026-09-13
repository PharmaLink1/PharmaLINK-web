"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";

/**
 * No Figma frame was provided for this section — the header's "How it
 * works" nav link needs a real target, so this is built from the copy
 * already written and approved in Page 10's PRD, styled with the same
 * tokens/spacing as the given Hero/Trust-Strip/Footer frames (Inter type,
 * brand green, hairline borders, flat design, 1280px container).
 */
export function LandingHowItWorks() {
  const { t } = useTranslation();

  const steps = [
    { title: t.landing.howItWorksStep1Title, body: t.landing.howItWorksStep1Body },
    { title: t.landing.howItWorksStep2Title, body: t.landing.howItWorksStep2Body },
    { title: t.landing.howItWorksStep3Title, body: t.landing.howItWorksStep3Body },
  ];

  return (
    <section id="how-it-works" className="w-full py-16 sm:py-20">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-10 px-[24px] text-center">
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-semibold text-[var(--color-brand)]">{t.landing.howItWorksEyebrow}</span>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] sm:text-[30px]">{t.landing.howItWorksTitle}</h2>
        </div>

        <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.title} className="flex flex-col items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brand)]/10 text-lg font-bold text-[var(--color-brand)]">
                {i + 1}
              </span>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{step.title}</h3>
              <p className="text-[15px] leading-6 text-[var(--color-text-secondary)]">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
