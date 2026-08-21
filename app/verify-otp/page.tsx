import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { VerifyOtpForm } from "@/components/auth/verify-otp-form";

export const metadata: Metadata = { title: "Verify your email — PharmaLink" };

export default async function VerifyOtpPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="mt-1.5 text-muted-foreground">
          We sent you a verification code to finish creating your account.
        </p>
      </div>
      <VerifyOtpForm email={email ?? ""} />
    </AuthLayout>
  );
}
