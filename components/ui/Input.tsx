import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  /** Slot rendered inside the input's right edge, e.g. a show/hide password toggle. */
  endAdornment?: ReactNode;
  /**
   * When false, the error text isn't rendered here — the caller displays it
   * itself (the input still shows its error styling). Used when an adjacent
   * element already occupies the line below the field.
   */
  showErrorText?: boolean;
}

export function Input({
  label,
  error,
  endAdornment,
  showErrorText = true,
  id,
  className = "",
  readOnly,
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col">
      {label && (
        <label htmlFor={id} className="mb-2 text-sm font-medium text-[var(--color-text-primary)]">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          readOnly={readOnly}
          className={`h-12 w-full rounded-[var(--radius-input)] border px-[17px] text-base text-[var(--color-text-primary)] outline-none transition-colors placeholder:text-[var(--color-text-placeholder)] focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
            readOnly ? "cursor-default bg-[var(--color-surface-readonly)]" : "bg-[var(--color-surface)]"
          } ${
            error
              ? "border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/20"
              : "border-[var(--color-border)] focus:border-[var(--color-focus)] focus:ring-[var(--color-focus)]/25"
          } ${endAdornment ? "pr-[49px]" : ""} ${className}`}
          aria-invalid={error ? true : undefined}
          {...props}
        />
        {endAdornment && (
          <div className="absolute inset-y-0 right-3 z-10 flex items-center">{endAdornment}</div>
        )}
      </div>
      {showErrorText && (
        // Height is always reserved so an error appearing/disappearing never
        // shifts the layout below it.
        <p className="mt-1 min-h-[20px] text-sm text-[var(--color-error)]" aria-live="polite">
          {error || "\u00A0"}
        </p>
      )}
    </div>
  );
}
