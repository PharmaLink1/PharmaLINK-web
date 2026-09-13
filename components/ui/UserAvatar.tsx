import Image from "next/image";
import { PersonIcon } from "@/components/ui/icons";

/**
 * Shared avatar — extracted from PatientTopNav's inline markup (Page 11 —
 * Profile PRD §4/§11: the same fallback logic must apply everywhere an
 * avatar appears, not just on Profile). Shows the photo when `avatarUrl` is
 * set, otherwise the user's first initial, otherwise a generic person icon
 * if there's no name yet (e.g. still loading).
 */
export function UserAvatar({
  name,
  avatarUrl,
  size = 32,
  className = "",
  ariaLabel,
}: {
  name?: string | null;
  avatarUrl?: string | null;
  size?: number;
  className?: string;
  /** Set this when the avatar stands alone (e.g. Profile's header) so it
   * has a real accessible name instead of being decorative — per Page 11
   * §8 "the avatar has an accessible name... not decorative". Omit it (the
   * default) when it sits inside an already-labeled Link, like the navs. */
  ariaLabel?: string;
}) {
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-text-secondary)] ${className}`}
      style={{ width: size, height: size }}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      {avatarUrl ? (
        <Image src={avatarUrl} alt="" fill sizes={`${size}px`} className="object-cover" unoptimized />
      ) : name ? (
        <span
          className="font-semibold text-[var(--color-text-primary)]"
          style={{ fontSize: Math.max(12, Math.round(size * 0.36)) }}
        >
          {name.charAt(0).toUpperCase()}
        </span>
      ) : (
        <PersonIcon />
      )}
    </span>
  );
}
