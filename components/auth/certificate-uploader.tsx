"use client";

import * as React from "react";
import { CheckCircle2, CircleAlert, ImageUp, LoaderCircle, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { useLanguage, interpolate } from "@/lib/i18n";
import {
  CertificateUploadError,
  isCloudinaryConfigured,
  uploadCertificateToCloudinary,
  validateCertificateFile,
} from "@/lib/cloudinary";

type Status = "idle" | "uploading" | "done";
type Issue = "invalid-type" | "invalid-size" | "upload-error" | "not-configured";

type CertificateUploaderProps = {
  /** Shared with the Field label and the sr-only file input. */
  id: string;
  /** The uploaded Cloudinary secure_url (empty until one exists). */
  url: string;
  onUrlChange: (url: string) => void;
  /** Lifted so the parent can disable submit and role switching mid-upload. */
  onBusyChange?: (busy: boolean) => void;
  disabled?: boolean;
};

export function CertificateUploader({
  id,
  url,
  onUrlChange,
  onBusyChange,
  disabled = false,
}: CertificateUploaderProps) {
  const { t } = useLanguage();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const configured = isCloudinaryConfigured();
  const [status, setStatus] = React.useState<Status>(url ? "done" : "idle");
  const [progress, setProgress] = React.useState(0);
  const [issue, setIssue] = React.useState<Issue | null>(null);
  const [fileName, setFileName] = React.useState("");
  const [dragging, setDragging] = React.useState(false);

  const issueText =
    issue === "invalid-type"
      ? t.forms.certificateInvalidType
      : issue === "invalid-size"
        ? t.forms.certificateInvalidSize
        : issue === "upload-error"
          ? t.forms.certificateUploadError
          : issue === "not-configured"
            ? t.forms.certificateNotConfigured
            : null;

  async function uploadFile(file: File) {
    const check = validateCertificateFile(file);
    if (check) {
      setIssue(check === "type" ? "invalid-type" : "invalid-size");
      return;
    }

    setIssue(null);
    setStatus("uploading");
    setProgress(0);
    setFileName(file.name);
    onBusyChange?.(true);
    try {
      const secureUrl = await uploadCertificateToCloudinary(file, (percent) => setProgress(percent));
      setStatus("done");
      onUrlChange(secureUrl);
    } catch (error) {
      const code =
        error instanceof CertificateUploadError ? error.code : "upload-failed";
      setIssue(
        code === "not-configured" ? "not-configured" : "upload-error",
      );
      // A failed replace keeps the previous image attached; a failed first
      // upload returns the field to its empty state.
      setStatus(url ? "done" : "idle");
    } finally {
      onBusyChange?.(false);
    }
  }

  function handleFile(file: File | undefined | null) {
    if (!file || disabled || !configured) return;
    void uploadFile(file);
  }

  function handleInputChange() {
    const file = inputRef.current?.files?.[0];
    if (inputRef.current) inputRef.current.value = "";
    handleFile(file);
  }

  function openPicker() {
    if (!disabled && configured) inputRef.current?.click();
  }

  function removeImage() {
    setStatus("idle");
    setIssue(null);
    setProgress(0);
    setFileName("");
    onUrlChange("");
  }

  if (!configured) {
    return (
      <div className="flex items-start gap-2.5 rounded-[var(--radius)] border border-dashed border-border px-4 py-4" role="alert">
        <CircleAlert className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
        <p className="text-sm text-muted-foreground">{t.forms.certificateNotConfigured}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-[var(--radius)] border bg-card px-4 py-4",
        status === "idle"
          ? "border-dashed border-border"
          : "border-border",
        dragging && "border-primary bg-primary-subtle/20",
        disabled && "opacity-60",
      )}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        handleFile(event.dataTransfer.files?.[0]);
      }}
    >
      <input
        ref={inputRef}
        id={id}
        name="degreeCertificate"
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        className="sr-only"
        disabled={disabled}
        onChange={handleInputChange}
      />

      {status === "uploading" ? (
        <div
          className="flex flex-col items-center gap-2 py-1 text-center"
          role="status"
          aria-live="polite"
        >
          <LoaderCircle className="size-5 animate-spin text-primary-strong" aria-hidden />
          <p className="text-sm">
            {interpolate(t.forms.certificateUploading, { percent: String(progress) })}
          </p>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            className="h-1.5 w-full max-w-56 overflow-hidden rounded-full bg-border"
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-150"
              style={{ width: progress + "%" }}
            />
          </div>
        </div>
      ) : url ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={t.forms.certificateLabel}
            className="h-20 w-20 shrink-0 rounded-md border border-border bg-muted object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {fileName || t.forms.certificateLabel}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-success">
              <CheckCircle2 className="size-3.5 shrink-0" aria-hidden />
              {t.forms.certificateUploaded}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openPicker}
              disabled={disabled}
            >
              <RefreshCw className="size-3.5" aria-hidden />
              {t.forms.certificateReplace}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeImage}
              disabled={disabled}
            >
              <X className="size-3.5" aria-hidden />
              {t.forms.certificateRemove}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2.5 py-1 text-center">
          <ImageUp className="size-6 text-muted-foreground" aria-hidden />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openPicker}
            disabled={disabled}
          >
            {t.forms.certificateChoose}
          </Button>
          <p className="text-xs text-muted-foreground">
            {t.forms.certificateDragHint}
          </p>
        </div>
      )}

      {issue && (
        <p
          role="alert"
          className="mt-3 flex items-start gap-1.5 text-xs font-medium text-danger"
        >
          <CircleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
          {issueText}
        </p>
      )}
    </div>
  );
}

