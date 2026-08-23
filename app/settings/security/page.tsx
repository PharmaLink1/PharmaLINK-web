import type { Metadata } from "next";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AppHeader } from "@/components/layout/app-header";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Security — PharmaLink" };

export default function SecuritySettingsPage() {
  return (
    <AuthGuard>
      <div className="flex min-h-dvh flex-col">
        <AppHeader />

        <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
          <h1 className="text-2xl font-semibold tracking-tight">Security</h1>
          <p className="mt-1 text-muted-foreground">Manage your password.</p>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Change password</CardTitle>
              <CardDescription>
                Enter your current password and choose a new one. You&apos;ll be signed out
                everywhere after the change.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm />
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  );
}
