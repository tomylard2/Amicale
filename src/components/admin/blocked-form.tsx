"use client";

import { useActionState, useEffect, useRef, useState } from "react";
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
  const [toutLeMateriel, setToutLeMateriel] = useState(true);

  // Réinitialise le formulaire après un ajout réussi
  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setToutLeMateriel(true);
    }
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
        <Label>Matériel concerné</Label>
        <input
          type="hidden"
          name="scope"
          value={toutLeMateriel ? "tout" : "specifique"}
        />

        <label className="mt-1 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={toutLeMateriel}
            onChange={(e) => setToutLeMateriel(e.target.checked)}
          />
          Tout le matériel
        </label>

        {!toutLeMateriel && (
          <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-input p-2 space-y-1">
            {equipements.map((e) => (
              <label key={e.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="equipmentIds" value={e.id} />
                {e.nom}
              </label>
            ))}
          </div>
        )}

        <p className="mt-1 text-xs text-muted-foreground">
          Décochez « Tout le matériel » pour sélectionner un ou plusieurs
          matériels précis.
        </p>
        <FieldError messages={state.fieldErrors?.equipmentIds} />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Ajout..." : "Ajouter l'indisponibilité"}
      </Button>
    </form>
  );
}
