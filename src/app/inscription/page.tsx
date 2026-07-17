import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Créer un compte",
};

export default async function InscriptionPage() {
  const session = await auth();
  if (session?.user) {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/espace");
  }

  return (
    <AuthShell wide>
      <RegisterForm />
    </AuthShell>
  );
}
