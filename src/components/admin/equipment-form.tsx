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
  prix?: number;
  prixExponentiel?: boolean;
  photoUrl?: string | null;
  options?: string[];
  tarifBeneficiaire?: boolean;
  prixAmicaleChateaubourg?: number | null;
  prixAutreAmicale?: number | null;
  prixAutreAssociation?: number | null;
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
  const [options, setOptions] = useState<string[]>(initial?.options ?? []);
  const [tarifBeneficiaire, setTarifBeneficiaire] = useState(
    initial?.tarifBeneficiaire ?? false,
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

      {/* Tarification standard */}
      <div>
        <Label htmlFor="prix">Prix de location (€)</Label>
        <Input
          id="prix"
          name="prix"
          type="number"
          min={0}
          step="0.01"
          defaultValue={initial?.prix ?? 0}
          disabled={tarifBeneficiaire}
        />
        <FieldError messages={state.fieldErrors?.prix} />
        <label className="mt-2 flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            name="prixExponentiel"
            defaultChecked={initial?.prixExponentiel ?? true}
            className="mt-0.5"
            disabled={tarifBeneficiaire}
          />
          <span>
            Exponentiel — le prix est multiplié par la quantité (ex : 20€ ×
            2 barnums = 40€). Décochez pour un prix fixe quelle que soit la
            quantité prise (ex : 5€ le lot, peu importe combien).
          </span>
        </label>
      </div>

      {/* Tarif selon le bénéficiaire */}
      <div className="rounded-lg border border-border p-4 space-y-3">
        <label className="flex items-start gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name="tarifBeneficiaire"
            checked={tarifBeneficiaire}
            onChange={(e) => setTarifBeneficiaire(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            Tarif différent selon le bénéficiaire
            <span className="block font-normal text-muted-foreground">
              Ex : la structure. Le prix ci-dessus est ignoré ; le membre choisira
              le bénéficiaire lors de la réservation.
            </span>
          </span>
        </label>

        {tarifBeneficiaire && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <Label htmlFor="prixAmicaleChateaubourg">
                Amicale de Châteaubourg (€)
              </Label>
              <Input
                id="prixAmicaleChateaubourg"
                name="prixAmicaleChateaubourg"
                type="number"
                min={0}
                step="0.01"
                defaultValue={initial?.prixAmicaleChateaubourg ?? ""}
                placeholder="Ex : 40"
              />
            </div>
            <div>
              <Label htmlFor="prixAutreAmicale">Autre amicale (€)</Label>
              <Input
                id="prixAutreAmicale"
                name="prixAutreAmicale"
                type="number"
                min={0}
                step="0.01"
                defaultValue={initial?.prixAutreAmicale ?? ""}
                placeholder="Ex : 60"
              />
            </div>
            <div>
              <Label htmlFor="prixAutreAssociation">Autre association (€)</Label>
              <Input
                id="prixAutreAssociation"
                name="prixAutreAssociation"
                type="number"
                min={0}
                step="0.01"
                defaultValue={initial?.prixAutreAssociation ?? ""}
                placeholder="Ex : 100"
              />
            </div>
            <FieldError messages={state.fieldErrors?.tarifBeneficiaire} />
          </div>
        )}
      </div>

      {/* Options gratuites */}
      <div className="rounded-lg border border-border p-4 space-y-2">
        <Label>Options gratuites (facultatif)</Label>
        <p className="text-xs text-muted-foreground">
          Ex : « Avec bâches latérales », « Avec micro ». Le membre pourra les
          cocher lors de la réservation. Sans incidence sur le prix.
        </p>
        {options.map((opt, i) => (
          <div key={i} className="flex gap-2">
            <Input
              name="options"
              value={opt}
              onChange={(e) =>
                setOptions((prev) =>
                  prev.map((o, j) => (j === i ? e.target.value : o)),
                )
              }
              placeholder="Libellé de l'option"
            />
            <button
              type="button"
              onClick={() =>
                setOptions((prev) => prev.filter((_, j) => j !== i))
              }
              className="shrink-0 h-10 px-3 rounded-lg border border-border text-danger hover:bg-muted"
              aria-label="Retirer l'option"
            >
              ✕
            </button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOptions((prev) => [...prev, ""])}
        >
          + Ajouter une option
        </Button>
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
