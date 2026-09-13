import type { ReactNode } from "react";
import { LanguagePill } from "@/components/ui/LanguagePill";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

/**
 * Shared shell for every (auth) route — login, signup, both registration
 * forms, and forgot-password. Puts the theme toggle and language pill in one
 * consistent top-right spot at the layout level, so every current AND future
 * auth page gets them automatically without re-implementing this row itself.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex w-full justify-end gap-2 px-5 pt-5 sm:px-6 sm:pt-6">
        <ThemeToggle />
        <LanguagePill />
      </div>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
