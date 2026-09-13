"use client";

import * as React from "react";
import { useLanguage, interpolate } from "@/lib/i18n";
import { cn } from "@/lib/cn";

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
  /** Fired once when all boxes are filled. */
  onComplete?: (value: string) => void;
  "aria-label"?: string;
};

/**
 * Segmented one-time-code input: individual digit boxes with auto-advance,
 * backspace-to-previous, and paste-to-fill. `value` is the source of truth.
 */
export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled,
  invalid,
  autoFocus,
  onComplete,
  "aria-label": ariaLabel,
}: OtpInputProps) {
  const { t } = useLanguage();
  const refs = React.useRef<Array<HTMLInputElement | null>>([]);
  const digits = React.useMemo(
    () => Array.from({ length }, (_, i) => value[i] ?? ""),
    [value, length],
  );

  const commit = (next: string) => {
    const cleaned = next.replace(/\D/g, "").slice(0, length);
    onChange(cleaned);
    if (cleaned.length === length) onComplete?.(cleaned);
  };

  const focusBox = (index: number) => {
    const clamped = Math.max(0, Math.min(length - 1, index));
    refs.current[clamped]?.focus();
    refs.current[clamped]?.select();
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    if (!digit) return;
    const chars = value.split("");
    chars[index] = digit;
    commit(chars.join("").slice(0, length));
    focusBox(index + 1);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const chars = value.split("");
      if (chars[index]) {
        chars[index] = "";
        commit(chars.join(""));
      } else if (index > 0) {
        chars[index - 1] = "";
        commit(chars.join(""));
        focusBox(index - 1);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusBox(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusBox(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    commit(pasted);
    focusBox(pasted.length);
  };

  return (
    <div className="flex gap-2" role="group" aria-label={ariaLabel ?? t.forms.verificationCode}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-label={interpolate(t.forms.digitN, { n: i + 1 })}
          autoFocus={autoFocus && i === 0}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            "h-14 w-full min-w-0 rounded-md border border-input bg-card text-center text-xl font-semibold text-foreground",
            "transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
            "disabled:cursor-not-allowed disabled:opacity-60",
            invalid && "border-danger ring-danger/30",
          )}
        />
      ))}
    </div>
  );
}
