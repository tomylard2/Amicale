"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createInvoice, type InvoiceFormState } from "@/lib/actions/invoice";
import { formatEuros } from "@/lib/utils";

type InvoiceItemDraft = { description: string; quantite: number; montant: number };

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="mt-1 text-xs text-danger">{messages[0]}</p>;
}

export function InvoiceForm({
  reservationId,
  initialClientNom,
  initialClientEmail,
  initialItems,
}: {
  reservationId?: string;
  initialClientNom?: string;
  initialClientEmail?: string;
  initialItems?: InvoiceItemDraft[];
}) {
  const [state, formAction, pending] = useActionState<InvoiceFormState, FormData>(
    createInvoice,
    {},
  );
  const [items, setItems] = useState<InvoiceItemDraft[]>(
    initialItems && initialItems.length > 0
      ? initialItems
      : [{ description: "", quantite: 1, montant: 0 }],
  );

  const total = items.reduce((sum, it) => sum + (Number(it.montant) || 0), 0);

  function updateItem(index: number, patch: Partial<InvoiceItemDraft>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, { description: "", quantite: 1, montant: 0 }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form action={formAction} className="space-y-5 max-w-2xl">
      {reservationId && (
        <input type="hidden" name="reservationId" value={reservationId} />
      )}
      <input type="hidden" name="itemsJson" value={JSON.stringify(items)} />

      {state.error && (
        <p className="rounded-lg bg-red-50 border border-red-200 text-danger text-sm px-3 py-2">
          {state.error}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="clientNom">Nom du client *</Label>
          <Input
            id="clientNom"
            name="clientNom"
            defaultValue={initialClientNom}
            placeholder="Ex : Amicale de X, ou Nom Prénom"
            required
          />
          <FieldError messages={state.fieldErrors?.clientNom} />
        </div>
        <div>
          <Label htmlFor="clientEmail">E-mail du client *</Label>
          <Input
            id="clientEmail"
            name="clientEmail"
            type="email"
            defaultValue={initialClientEmail}
            required
          />
          <FieldError messages={state.fieldErrors?.clientEmail} />
        </div>
      </div>

      <div>
        <Label htmlFor="clientAdresse">Adresse du client</Label>
        <Input
          id="clientAdresse"
          name="clientAdresse"
          placeholder="Facultatif"
        />
        <FieldError messages={state.fieldErrors?.clientAdresse} />
      </div>

      <div className="space-y-3">
        <Label>Lignes de la facture *</Label>
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="flex-1">
              <Input
                aria-label="Description"
                value={item.description}
                onChange={(e) => updateItem(i, { description: e.target.value })}
                placeholder="Ex : Location Barnum 3x3"
              />
            </div>
            <div className="w-20">
              <Input
                aria-label="Quantité"
                type="number"
                min={1}
                step={1}
                value={item.quantite}
                onChange={(e) => updateItem(i, { quantite: Number(e.target.value) })}
              />
            </div>
            <div className="w-28">
              <Input
                aria-label="Montant"
                type="number"
                min={0}
                step="0.01"
                value={item.montant}
                onChange={(e) => updateItem(i, { montant: Number(e.target.value) })}
                placeholder="€"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => removeItem(i)}
              disabled={items.length === 1}
              aria-label="Supprimer la ligne"
            >
              ✕
            </Button>
          </div>
        ))}
        <FieldError messages={state.fieldErrors?.items} />
        <Button type="button" variant="outline" onClick={addItem}>
          + Ajouter une ligne
        </Button>
      </div>

      <div className="text-right text-lg font-semibold">
        Total : {formatEuros(total)}
      </div>

      <div>
        <Label htmlFor="caution">Caution demandée en complément (€)</Label>
        <Input
          id="caution"
          name="caution"
          type="number"
          min={0}
          step="0.01"
          placeholder="Facultatif"
        />
        <FieldError messages={state.fieldErrors?.caution} />
      </div>

      <div>
        <Label htmlFor="notes">Notes (affichées sur la facture)</Label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Facultatif : conditions de paiement, précisions..."
          className="flex w-full rounded-lg border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground"
        />
        <FieldError messages={state.fieldErrors?.notes} />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Création..." : "Créer la facture"}
        </Button>
        <Button asChild variant="outline" type="button">
          <Link href="/admin/factures">Annuler</Link>
        </Button>
      </div>
    </form>
  );
}
