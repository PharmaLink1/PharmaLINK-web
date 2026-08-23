import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = { title: "Forgot password — PharmaLink" };

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Forgot your password?</h1>
        <p className="mt-1.5 text-muted-foreground">
          Enter your email and we&apos;ll send you a code to reset it.
        </p>
      </div>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
