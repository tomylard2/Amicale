import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
};

export default function MotDePasseOubliePage() {
  return (
    <AuthShell>
      <div className="text-center space-y-4">
        <h1 className="text-lg font-semibold text-white">Mot de passe oublié</h1>
        <p className="text-sm text-slate-300">
          La réinitialisation du mot de passe par e-mail sera bientôt
          disponible. En attendant, contactez un administrateur de l&apos;amicale
          pour réinitialiser votre accès.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg border border-primary text-white px-5 h-10 leading-10 text-sm font-semibold hover:bg-primary transition-colors"
        >
          Retour à la connexion
        </Link>
      </div>
    </AuthShell>
  );
}
