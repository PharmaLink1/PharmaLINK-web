"use client";

import { useLanguage } from "@/lib/i18n";
import { AppHeader } from "@/components/layout/app-header";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SecurityContent() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">{t.settings.security}</h1>
        <p className="mt-1 text-muted-foreground">{t.settings.subtitle}</p>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{t.settings.changePassword}</CardTitle>
            <CardDescription>{t.settings.changePasswordDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
