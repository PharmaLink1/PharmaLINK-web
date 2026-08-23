import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = { title: "List your pharmacy — PharmaLink" };

export default function PharmacistApplyPage() {
  return (
    <AuthLayout>
      <SignUpForm defaultRole="pharmacist" />
    </AuthLayout>
  );
}
