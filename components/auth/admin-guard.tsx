"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { useSession } from "@/lib/auth-context";
import { Spinner } from "@/components/ui/spinner";

/**
 * Gates admin-only routes: waits for session hydration, sends unauthenticated
 * visitors to sign in and authenticated non-admins back to the dashboard.
 * The backend still enforces the role — this just keeps the UI honest.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { status, user } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (status === "unauthenticated") router.replace("/signin");
    else if (status === "authenticated" && user?.role !== "admin") router.replace("/dashboard");
  }, [status, user, router]);

  if (status !== "authenticated" || user?.role !== "admin") {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner label="Loading" />
      </div>
    );
  }

  return <>{children}</>;
}
