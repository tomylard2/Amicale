"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createUserByAdmin } from "@/lib/actions/admin-users";

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="mt-1 text-xs text-danger">{messages[0]}</p>;
}

export function CreateUserForm() {
  const [state, formAction, pending] = useActionState(createUserByAdmin, {});

  return (
    <form action={formAction} className="space-y-5 max-w-2xl">
      {state.error && (
        <p className="rounded-lg bg-red-50 border border-red-200 text-danger text-sm px-3 py-2">
          {state.error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="prenom">Prénom *</Label>
          <Input id="prenom" name="prenom" required />
          <FieldError messages={state.fieldErrors?.prenom} />
        </div>
        <div>
          <Label htmlFor="nom">Nom *</Label>
          <Input id="nom" name="nom" required />
          <FieldError messages={state.fieldErrors?.nom} />
        </div>
      </div>

      <div>
        <Label htmlFor="email">E-mail *</Label>
        <Input id="email" name="email" type="email" required />
        <FieldError messages={state.fieldErrors?.email} />
      </div>

      <div>
        <Label htmlFor="telephone">Téléphone</Label>
        <Input
          id="telephone"
          name="telephone"
          type="tel"
          placeholder="06 12 34 56 78"
        />
        <FieldError messages={state.fieldErrors?.telephone} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="password">Mot de passe initial *</Label>
          <Input id="password" name="password" type="text" required />
          <p className="mt-1 text-xs text-muted-foreground">
            Communiquez-le au membre ; il pourra le changer ensuite.
          </p>
          <FieldError messages={state.fieldErrors?.password} />
        </div>
        <div>
          <Label htmlFor="role">Rôle *</Label>
          <select
            id="role"
            name="role"
            defaultValue="USER"
            className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
          >
            <option value="USER">Membre</option>
            <option value="ADMIN">Administrateur</option>
          </select>
          <FieldError messages={state.fieldErrors?.role} />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Création..." : "Créer le compte"}
        </Button>
        <Button asChild variant="outline" type="button">
          <Link href="/admin/utilisateurs">Annuler</Link>
        </Button>
      </div>
    </form>
  );
}
