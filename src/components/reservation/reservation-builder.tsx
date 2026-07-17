"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  createReservation,
  type ReservationState,
} from "@/lib/actions/reservation";
import { formatEuros } from "@/lib/utils";

export type BuilderItem = {
  id: string;
  nom: string;
  description: string | null;
  photoUrl: string | null;
  available: number;
  caution: number | null;
  quantiteTotale: number;
};

type BuilderAction = (
  state: ReservationState,
  formData: FormData,
) => Promise<ReservationState>;

export function ReservationBuilder({
  dateDebut,
  dateFin,
  items,
  action = createReservation,
  reservationId,
  initialQuantities,
  submitLabel = "Valider ma réservation",
}: {
  dateDebut: string;
  dateFin: string;
  items: BuilderItem[];
  action?: BuilderAction;
  reservationId?: string;
  initialQuantities?: Record<string, number>;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [quantities, setQuantities] = useState<Record<string, number>>(
    initialQuantities ?? {},
  );

  const disponibles = items.filter((i) => i.available > 0);
  const indisponibles = items.filter((i) => i.available === 0);

  const setQty = (id: string, value: number, max: number) => {
    const v = Math.max(0, Math.min(max, Math.floor(value || 0)));
    setQuantities((q) => ({ ...q, [id]: v }));
  };

  const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);
  const totalCaution = items.reduce((sum, i) => {
    const q = quantities[i.id] ?? 0;
    return sum + q * (i.caution ?? 0);
  }, 0);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="dateDebut" value={dateDebut} />
      <input type="hidden" name="dateFin" value={dateFin} />
      {reservationId && (
        <input type="hidden" name="reservationId" value={reservationId} />
      )}

      {state.error && (
        <p className="rounded-lg bg-red-50 border border-red-200 text-danger text-sm px-3 py-2">
          {state.error}
        </p>
      )}

      {disponibles.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          Aucun matériel n&apos;est disponible sur cette période.
        </Card>
      ) : (
        <div className="space-y-3">
          {disponibles.map((item) => {
            const qty = quantities[item.id] ?? 0;
            return (
              <Card key={item.id} className="p-4">
                <div className="flex items-center gap-4">
                  {item.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.photoUrl}
                      alt={item.nom}
                      className="h-16 w-16 rounded-lg object-cover border border-border shrink-0"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-lg bg-muted grid place-items-center text-2xl shrink-0">
                      📦
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{item.nom}</p>
                    <p className="text-sm text-success">
                      {item.available} disponible{item.available > 1 ? "s" : ""}
                    </p>
                    {item.caution != null && (
                      <p className="text-xs text-muted-foreground">
                        Caution unitaire : {formatEuros(item.caution)}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setQty(item.id, qty - 1, item.available)}
                      className="h-9 w-9 rounded-lg border border-border text-lg leading-none hover:bg-muted disabled:opacity-40"
                      disabled={qty <= 0}
                      aria-label="Diminuer"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      name={`qty_${item.id}`}
                      min={0}
                      max={item.available}
                      value={qty}
                      onChange={(e) =>
                        setQty(item.id, Number(e.target.value), item.available)
                      }
                      className="h-9 w-16 rounded-lg border border-input text-center text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setQty(item.id, qty + 1, item.available)}
                      className="h-9 w-9 rounded-lg border border-border text-lg leading-none hover:bg-muted disabled:opacity-40"
                      disabled={qty >= item.available}
                      aria-label="Augmenter"
                    >
                      +
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {indisponibles.length > 0 && (
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Indisponible sur cette période
          </p>
          <div className="flex flex-wrap gap-2">
            {indisponibles.map((item) => (
              <span
                key={item.id}
                className="text-sm rounded-lg bg-muted px-3 py-1.5 text-muted-foreground line-through"
              >
                {item.nom}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <label
          htmlFor="note"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          Note (facultatif)
        </label>
        <textarea
          id="note"
          name="note"
          rows={2}
          placeholder="Précision sur l'événement, l'horaire de retrait..."
          className="flex w-full rounded-lg border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground"
        />
      </div>

      {disponibles.length > 0 && (
        <Card className="p-4 flex items-center justify-between gap-4 flex-wrap bg-muted/50">
          <div className="text-sm">
            <p>
              <span className="font-medium">{totalItems}</span> article
              {totalItems > 1 ? "s" : ""} sélectionné{totalItems > 1 ? "s" : ""}
            </p>
            {totalCaution > 0 && (
              <p className="text-muted-foreground">
                Caution totale estimée : {formatEuros(totalCaution)}
              </p>
            )}
          </div>
          <Button type="submit" size="lg" disabled={pending || totalItems === 0}>
            {pending ? "Validation..." : submitLabel}
          </Button>
        </Card>
      )}
    </form>
  );
}
