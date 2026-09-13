"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { CameraIcon } from "@/components/ui/icons";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/i18n/useTranslation";

/** Mirrors Page 4's document-upload cap (`MAX_FILE_SIZE_BYTES` in
 * PharmacyRegistrationForm.tsx) for consistency, not a new number. */
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png"];

/**
 * Card 1 — Profile header, extracted from the Figma frame (node 45:1259,
 * "Section - 1. Profile Header"): large avatar + a camera-icon "change
 * photo" button overlaid on its corner + name + email. The photo picker is
 * a single JPG/PNG file, deliberately simpler than the multi-file
 * FileUploadDropzone used for pharmacy license documents (Page 11 PRD §4).
 */
export function ProfileHeaderCard() {
  const { user, updateProfilePhoto } = useAuth();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Reset so choosing the same file again still fires a change event.
    e.target.value = "";
    if (!file) return;

    if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
      setPhotoError(t.profile.photoTypeError);
      return;
    }
    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      setPhotoError(t.profile.photoSizeError);
      return;
    }

    setPhotoError(null);
    setPreviewUrl(URL.createObjectURL(file));
    setIsUploading(true);
    try {
      await updateProfilePhoto(file);
      setPreviewUrl(null); // user.avatarUrl from context takes over
    } catch {
      setPreviewUrl(null);
      setPhotoError(t.profile.photoFailure);
    } finally {
      setIsUploading(false);
    }
  }

  const avatarUrl = previewUrl ?? user?.avatarUrl;

  return (
    <div className="flex flex-col items-center gap-1 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-8 text-center">
      <div className="relative mb-2">
        <UserAvatar
          name={user?.name}
          avatarUrl={avatarUrl}
          size={88}
          className={isUploading ? "opacity-60" : ""}
          ariaLabel={t.profile.avatarAccessibleName}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          aria-label={t.profile.changePhoto}
          className="absolute right-0 bottom-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-brand)] shadow-[0px_1px_1px_rgba(0,0,0,0.05)] transition-colors hover:bg-[var(--color-canvas)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <CameraIcon />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleFileChange}
          className="hidden"
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>

      <p className="text-xl font-semibold text-[var(--color-text-primary)]">{user?.name}</p>
      <p className="text-sm text-[var(--color-text-secondary)]">{user?.email}</p>

      {isUploading && <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{t.profile.uploading}</p>}
      {photoError && (
        <p className="mt-1 text-sm text-[var(--color-error)]" role="alert">
          {photoError}
        </p>
      )}
    </div>
  );
}
