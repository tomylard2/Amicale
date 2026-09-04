"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  createReservation,
  type ReservationState,
} from "@/lib/actions/reservation";
import { formatEuros, beneficiairePrice } from "@/lib/utils";
import {
  BENEFICIAIRES,
  BENEFICIAIRE_ORDER,
  BENEFICIAIRE_LABELS,
  type Beneficiaire,
} from "@/lib/constants";

export type BuilderItem = {
  id: string;
  nom: string;
  description: string | null;
  photoUrl: string | null;
  available: number;
  caution: number | null;
  quantiteTotale: number;
  prix: number;
  prixExponentiel: boolean;
  options: string[];
  tarifBeneficiaire: boolean;
  prixAmicaleChateaubourg: number | null;
  prixAutreAmicale: number | null;
  prixAutreAssociation: number | null;
};

type BuilderAction = (
  state: ReservationState,
  formData: FormData,
) => Promise<ReservationState>;

/**
 * Catégories de bénéficiaire réellement proposées pour un item : celles
 * dont le prix est renseigné sur le matériel, ET autorisées pour la
 * catégorie du membre connecté.
 */
function beneficiaireChoices(item: BuilderItem, allowedBeneficiaires: Beneficiaire[]) {
  const prices: Record<Beneficiaire, number | null> = {
    CHATEAUBOURG: item.prixAmicaleChateaubourg,
    AUTRE_AMICALE: item.prixAutreAmicale,
    AUTRE_ASSOCIATION: item.prixAutreAssociation,
  };
  return BENEFICIAIRE_ORDER.filter(
    (b) => prices[b] != null && allowedBeneficiaires.includes(b),
  ).map((b) => ({
    value: b,
    label: BENEFICIAIRE_LABELS[b],
    prix: prices[b] as number,
  }));
}

export function ReservationBuilder({
  dateDebut,
  dateFin,
  items,
  action = createReservation,
  reservationId,
  initialQuantities,
  initialOptions,
  initialBeneficiaires,
  allowedBeneficiaires,
  submitLabel = "Valider ma réservation",
}: {
  dateDebut: string;
  dateFin: string;
  items: BuilderItem[];
  action?: BuilderAction;
  reservationId?: string;
  initialQuantities?: Record<string, number>;
  initialOptions?: Record<string, string[]>;
  initialBeneficiaires?: Record<string, Beneficiaire>;
  /** Tarifs bénéficiaire autorisés pour le membre concerné par cette réservation. */
  allowedBeneficiaires: Beneficiaire[];
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [quantities, setQuantities] = useState<Record<string, number>>(
    initialQuantities ?? {},
  );
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string[]>
  >(initialOptions ?? {});
  const [beneficiaires, setBeneficiaires] = useState<
    Record<string, Beneficiaire>
  >(initialBeneficiaires ?? {});

  const disponibles = items.filter((i) => i.available > 0);
  const indisponibles = items.filter((i) => i.available === 0);

  const setQty = (id: string, value: number, max: number) => {
    const v = Math.max(0, Math.min(max, Math.floor(value || 0)));
    setQuantities((q) => ({ ...q, [id]: v }));
  };

  const toggleOption = (id: string, label: string, checked: boolean) => {
    setSelectedOptions((prev) => {
      const cur = prev[id] ?? [];
      return {
        ...prev,
        [id]: checked ? [...cur, label] : cur.filter((l) => l !== label),
      };
    });
  };

  const beneficiaireOf = (item: BuilderItem): Beneficiaire => {
    const choices = beneficiaireChoices(item, allowedBeneficiaires);
    return beneficiaires[item.id] ?? choices[0]?.value ?? BENEFICIAIRES.CHATEAUBOURG;
  };

  const lineTotal = (item: BuilderItem): number => {
    const q = quantities[item.id] ?? 0;
    if (q === 0) return 0;
    if (item.tarifBeneficiaire) {
      return beneficiairePrice(item, beneficiaireOf(item));
    }
    return item.prixExponentiel ? item.prix * q : item.prix;
  };

  const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);
  const totalCaution = items.reduce((sum, i) => {
    const q = quantities[i.id] ?? 0;
    return sum + q * (i.caution ?? 0);
  }, 0);
  const totalPrix = items.reduce((sum, i) => sum + lineTotal(i), 0);

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
            const choices = beneficiaireChoices(item, allowedBeneficiaires);
            const chosenBenef = beneficiaireOf(item);
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
                    {item.tarifBeneficiaire ? (
                      <p className="text-xs font-medium">
                        Tarif selon le bénéficiaire (à choisir ci-dessous)
                      </p>
                    ) : (
                      item.prix > 0 && (
                        <p className="text-xs font-medium">
                          Prix :{" "}
                          {item.prixExponentiel
                            ? `${formatEuros(item.prix)} / unité`
                            : `${formatEuros(item.prix)} (forfait, quelle que soit la quantité)`}
                        </p>
                      )
                    )}
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

                {/* Bénéficiaire (matériel à tarif bénéficiaire, si sélectionné) */}
                {qty > 0 && item.tarifBeneficiaire && choices.length > 0 && (
                  <div className="mt-3 border-t border-border pt-3">
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor={`benef-${item.id}`}
                    >
                      Pour qui ? *
                    </label>
                    <select
                      id={`benef-${item.id}`}
                      name={`beneficiaire_${item.id}`}
                      value={chosenBenef}
                      onChange={(e) =>
                        setBeneficiaires((prev) => ({
                          ...prev,
                          [item.id]: e.target.value as Beneficiaire,
                        }))
                      }
                      className="h-10 w-full sm:w-96 rounded-lg border border-input bg-card px-3 text-sm"
                    >
                      {choices.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label} — {formatEuros(c.prix)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Options gratuites (si sélectionné) */}
                {qty > 0 && item.options.length > 0 && (
                  <div className="mt-3 border-t border-border pt-3">
                    <p className="text-sm font-medium mb-1">
                      Options (gratuites)
                    </p>
                    <div className="flex flex-col gap-1">
                      {item.options.map((opt) => {
                        const checked = (selectedOptions[item.id] ?? []).includes(
                          opt,
                        );
                        return (
                          <label
                            key={opt}
                            className="flex items-center gap-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              name={`options_${item.id}`}
                              value={opt}
                              checked={checked}
                              onChange={(e) =>
                                toggleOption(item.id, opt, e.target.checked)
                              }
                            />
                            {opt}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
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
            {totalPrix > 0 && (
              <p className="font-medium">
                Total estimé : {formatEuros(totalPrix)}
              </p>
            )}
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
