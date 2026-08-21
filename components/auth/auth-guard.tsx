"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { useSession } from "@/lib/auth-context";
import { Spinner } from "@/components/ui/spinner";

/** Gates protected routes: waits for session hydration, else redirects to sign in. */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (status === "unauthenticated") router.replace("/signin");
  }, [status, router]);

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner label="Loading your account" />
      </div>
    );
  }

  return <>{children}</>;
}
