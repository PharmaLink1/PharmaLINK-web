import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { VerifyOtpForm } from "@/components/auth/verify-otp-form";
import { localizedMetadata } from "@/lib/i18n/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata("verifyOtp");
}

export default async function VerifyOtpPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <AuthLayout>
      <VerifyOtpForm email={email ?? ""} />
    </AuthLayout>
  );
}
