"use client";

import { useActionState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createBlockedPeriod, type BlockedState } from "@/lib/actions/blocked";
import { todayInput } from "@/lib/dates";

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="mt-1 text-xs text-danger">{messages[0]}</p>;
}

export function BlockedPeriodForm({
  equipements,
}: {
  equipements: { id: string; nom: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    createBlockedPeriod,
    {} as BlockedState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const today = todayInput();

  // Réinitialise le formulaire après un ajout réussi
  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {state.success && (
        <p className="rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm px-3 py-2">
          Période d&apos;indisponibilité ajoutée.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="dateDebut">Date de début</Label>
          <Input id="dateDebut" name="dateDebut" type="date" min={today} required />
          <FieldError messages={state.fieldErrors?.dateDebut} />
        </div>
        <div>
          <Label htmlFor="dateFin">Date de fin</Label>
          <Input id="dateFin" name="dateFin" type="date" min={today} required />
          <FieldError messages={state.fieldErrors?.dateFin} />
        </div>
      </div>

      <div>
        <Label htmlFor="motif">Motif</Label>
        <Input
          id="motif"
          name="motif"
          placeholder="Ex : Fête de la Saint-Jean, maintenance..."
          required
        />
        <FieldError messages={state.fieldErrors?.motif} />
      </div>

      <div>
        <Label htmlFor="equipmentId">Matériel concerné</Label>
        <select
          id="equipmentId"
          name="equipmentId"
          defaultValue=""
          className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
        >
          <option value="">Tout le matériel</option>
          {equipements.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nom}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-muted-foreground">
          Laissez « Tout le matériel » pour bloquer entièrement la période.
        </p>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Ajout..." : "Ajouter l'indisponibilité"}
      </Button>
    </form>
  );
}
