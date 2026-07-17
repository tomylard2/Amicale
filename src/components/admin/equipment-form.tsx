"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { EquipmentFormState } from "@/lib/actions/equipment";

type EquipmentInitial = {
  id?: string;
  nom?: string;
  description?: string | null;
  quantiteTotale?: number;
  caution?: number | null;
  photoUrl?: string | null;
};

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="mt-1 text-xs text-danger">{messages[0]}</p>;
}

export function EquipmentForm({
  action,
  initial,
  submitLabel,
}: {
  action: (
    state: EquipmentFormState,
    formData: FormData,
  ) => Promise<EquipmentFormState>;
  initial?: EquipmentInitial;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [preview, setPreview] = useState<string | null>(
    initial?.photoUrl ?? null,
  );

  return (
    <form action={formAction} className="space-y-5 max-w-2xl">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}

      {state.error && (
        <p className="rounded-lg bg-red-50 border border-red-200 text-danger text-sm px-3 py-2">
          {state.error}
        </p>
      )}

      <div>
        <Label htmlFor="nom">Nom du matériel *</Label>
        <Input
          id="nom"
          name="nom"
          defaultValue={initial?.nom}
          placeholder="Ex : Table pliante"
          required
        />
        <FieldError messages={state.fieldErrors?.nom} />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          defaultValue={initial?.description ?? ""}
          rows={3}
          placeholder="Détails utiles (dimensions, état, consignes...)"
          className="flex w-full rounded-lg border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground"
        />
        <FieldError messages={state.fieldErrors?.description} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quantiteTotale">Quantité disponible *</Label>
          <Input
            id="quantiteTotale"
            name="quantiteTotale"
            type="number"
            min={1}
            step={1}
            defaultValue={initial?.quantiteTotale ?? 1}
            required
          />
          <FieldError messages={state.fieldErrors?.quantiteTotale} />
        </div>
        <div>
          <Label htmlFor="caution">Caution (€)</Label>
          <Input
            id="caution"
            name="caution"
            type="number"
            min={0}
            step="0.01"
            defaultValue={initial?.caution ?? ""}
            placeholder="Facultatif"
          />
          <FieldError messages={state.fieldErrors?.caution} />
        </div>
      </div>

      <div>
        <Label htmlFor="photo">Photo</Label>
        <input
          id="photo"
          name="photo"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={(e) => {
            const file = e.target.files?.[0];
            setPreview(file ? URL.createObjectURL(file) : initial?.photoUrl ?? null);
          }}
          className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:text-white file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-700 cursor-pointer"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          JPEG, PNG, WebP ou GIF — 5 Mo maximum.
        </p>
        <FieldError messages={state.fieldErrors?.photo} />
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Aperçu"
            className="mt-3 h-32 w-32 rounded-lg object-cover border border-border"
          />
        )}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement..." : submitLabel}
        </Button>
        <Button asChild variant="outline" type="button">
          <Link href="/admin/materiel">Annuler</Link>
        </Button>
      </div>
    </form>
  );
}
