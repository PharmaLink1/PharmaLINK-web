"use client";

import { useRef, type ChangeEvent } from "react";
import { UploadCloudIcon } from "@/components/ui/icons";

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * License/permit upload dropzone (Page 4, node 6:215, "Dropzone Empty
 * State" + the reused-component spec in the PRD: "Choose file" button +
 * dashed drop area; after selection shows file chips with remove). Click
 * to select rather than drag-only, so it stays keyboard-operable (§8).
 */
export function FileUploadDropzone({
  files,
  onFilesChange,
  chooseFileLabel,
  hintText,
  removeFileLabel,
  error,
}: {
  files: File[];
  onFilesChange: (files: File[]) => void;
  chooseFileLabel: string;
  hintText: string;
  removeFileLabel: string;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length > 0) onFilesChange([...files, ...selected]);
    e.target.value = ""; // allow re-selecting the same file after removing it
  }

  function removeFile(index: number) {
    onFilesChange(files.filter((_, i) => i !== index));
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div
        className={`flex w-full flex-col items-center justify-center gap-3 rounded-[12px] border border-dashed px-4 py-8 text-center ${
          error ? "border-[var(--color-error)] bg-[var(--color-error-bg)]" : "border-[#bfc9c4] bg-[var(--color-surface-muted)]"
        }`}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-border)] text-[var(--color-text-secondary)]">
          <UploadCloudIcon />
        </span>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface)] px-[17px] py-2 text-base font-semibold text-[var(--color-brand)] transition-colors hover:bg-[var(--color-canvas)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]/40"
        >
          {chooseFileLabel}
        </button>
        <p className="text-[13px] text-[var(--color-text-placeholder)]">{hintText}</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {error && (
        <p className="text-sm text-[var(--color-error)]" role="alert">
          {error}
        </p>
      )}

      {files.length > 0 && (
        <ul className="flex flex-col gap-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between gap-3 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5"
            >
              <span className="truncate text-sm text-[var(--color-text-primary)]">
                {file.name} <span className="text-[var(--color-text-secondary)]">({formatFileSize(file.size)})</span>
              </span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                aria-label={`${removeFileLabel}: ${file.name}`}
                className="shrink-0 text-sm font-medium text-[var(--color-error)] hover:underline"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
