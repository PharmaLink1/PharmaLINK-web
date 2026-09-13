"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/Input";
import { EyeIcon, EyeOffIcon } from "@/components/ui/icons";

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  showLabel?: string;
  hideLabel?: string;
  showErrorText?: boolean;
}

/**
 * Password field with a show/hide toggle, built on top of Input's
 * endAdornment slot rather than duplicating Input's core styling.
 */
export function PasswordInput({
  label,
  error,
  showLabel = "Show",
  hideLabel = "Hide",
  showErrorText = true,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      {...props}
      label={label}
      error={error}
      showErrorText={showErrorText}
      type={visible ? "text" : "password"}
      endAdornment={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]/40"
        >
          {visible ? <EyeIcon /> : <EyeOffIcon />}
        </button>
      }
    />
  );
}
