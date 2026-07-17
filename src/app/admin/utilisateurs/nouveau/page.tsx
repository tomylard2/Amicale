import type { Metadata } from "next";
import Link from "next/link";
import { CreateUserForm } from "@/components/admin/create-user-form";

export const metadata: Metadata = {
  title: "Ajouter un membre",
};

export default function NouveauMembrePage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/utilisateurs"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Retour aux utilisateurs
        </Link>
        <h1 className="text-2xl font-bold mt-2">Ajouter un membre</h1>
        <p className="text-muted-foreground mt-1">
          Le compte sera immédiatement actif et approuvé.
        </p>
      </div>
      <CreateUserForm />
    </div>
  );
}
