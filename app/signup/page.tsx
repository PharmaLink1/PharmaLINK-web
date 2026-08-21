import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = { title: "Create account — PharmaLink" };

export default function SignUpPage() {
  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="mt-1.5 text-muted-foreground">
          Join PharmaLink to find medicines near you.
        </p>
      </div>
      <SignUpForm />
    </AuthLayout>
  );
}
