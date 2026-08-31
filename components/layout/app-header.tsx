"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { ChevronDown, ClipboardList, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth-context";
import { Logo } from "@/components/ui/logo";

const roleLabels: Record<string, string> = {
  user: "Patient",
  pharmacist: "Pharmacist",
  admin: "Admin",
};

/** Authenticated app header with a user menu (name + role + logout). */
export function AppHeader() {
  const { user, logout } = useSession();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const name = user ? [user.firstName, user.lastName].filter(Boolean).join(" ") : "";

  React.useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function handleLogout() {
    setOpen(false);
    await logout();
    router.replace("/");
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />

        <div className="flex items-center gap-1 sm:gap-2">
          {user?.role === "admin" && (
            <Link
              href="/admin/pharmacist-applications"
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <ClipboardList className="size-4 text-muted-foreground" aria-hidden />
              <span className="hidden sm:inline">Applications</span>
            </Link>
          )}

          <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={open}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-primary-subtle text-primary">
              <User className="size-4" aria-hidden />
            </span>
            <span className="hidden text-left sm:block">
              <span className="block max-w-[12rem] truncate font-medium leading-tight">
                {name || "Account"}
              </span>
              {user && (
                <span className="block text-xs leading-tight text-muted-foreground">
                  {roleLabels[user.role] ?? user.role}
                </span>
              )}
            </span>
            <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
          </button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-56 overflow-hidden rounded-md border border-border bg-card shadow-md"
            >
              <div className="border-b border-border px-3 py-2.5">
                <p className="truncate text-sm font-medium">{name || "Account"}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <Link
                href="/settings/security"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted"
              >
                <Settings className="size-4 text-muted-foreground" aria-hidden />
                Change password
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted"
              >
                <LogOut className="size-4 text-muted-foreground" aria-hidden />
                Log out
              </button>
            </div>
          )}
          </div>
        </div>
      </div>
    </header>
  );
}
