import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignOutButton } from "@/components/layout/sign-out-button";

export const metadata: Metadata = {
  title: "Compte en attente",
};

export default function EnAttentePage() {
  return (
    <AuthShell>
      <div className="text-center space-y-4">
        <div className="text-4xl" aria-hidden>
          ⏳
        </div>
        <h1 className="text-lg font-semibold text-white">
          Compte en attente d&apos;approbation
        </h1>
        <p className="text-sm text-slate-300">
          Votre compte a bien été créé mais doit être{" "}
          <strong className="text-white">validé par un administrateur</strong>{" "}
          avant que vous puissiez accéder au catalogue et réserver du matériel.
          Vous serez prévenu par e-mail dès son activation.
        </p>
        <SignOutButton className="inline-block rounded-lg border border-primary text-white px-5 h-10 leading-10 text-sm font-semibold hover:bg-primary transition-colors" />
      </div>
    </AuthShell>
  );
}
