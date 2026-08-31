import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = { title: "Login — PharmaLink" };

export default function SignInPage() {
  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-1.5 text-muted-foreground">Log in to continue to PharmaLink.</p>
      </div>
      <SignInForm />
    </AuthLayout>
  );
}
