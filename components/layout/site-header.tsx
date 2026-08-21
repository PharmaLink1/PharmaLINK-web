"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-context";
import { Logo } from "@/components/ui/logo";
import { buttonVariants } from "@/components/ui/button";

/** Public marketing header. Auth-aware: shows sign in / sign up, or a dashboard link. */
export function SiteHeader() {
  const { status } = useSession();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />
        <nav className="flex items-center gap-2">
          {status === "authenticated" ? (
            <Link href="/dashboard" className={buttonVariants({ size: "sm" })}>
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link href="/signin" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Sign in
              </Link>
              <Link href="/signup" className={buttonVariants({ size: "sm" })}>
                Create account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
