import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { localizedMetadata } from "@/lib/i18n/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata("signupPharmacy");
}

export default function PharmacistApplyPage() {
  return (
    <AuthLayout>
      <SignUpForm defaultRole="pharmacist" />
    </AuthLayout>
  );
}
