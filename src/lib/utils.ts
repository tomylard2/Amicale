import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine des classes Tailwind en gérant les conflits (ex: "p-2" + "p-4"
 * ne garde que "p-4"). Utilisé par tous les composants d'interface.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formate un prix en euros (ex: 1200 -> "1 200,00 €") */
export function formatEuros(montant: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(montant);
}

type PricedEquipment = {
  prix: number;
  prixExponentiel: boolean;
  tarifBeneficiaire?: boolean;
  prixAmicaleChateaubourg?: number | null;
  prixAutreAmicale?: number | null;
  prixAutreAssociation?: number | null;
};

/** Prix d'un matériel à tarif bénéficiaire selon la catégorie choisie. */
export function beneficiairePrice(
  equipment: PricedEquipment,
  beneficiaire: string | null | undefined,
): number {
  const map: Record<string, number | null | undefined> = {
    CHATEAUBOURG: equipment.prixAmicaleChateaubourg,
    AUTRE_AMICALE: equipment.prixAutreAmicale,
    AUTRE_ASSOCIATION: equipment.prixAutreAssociation,
  };
  return (beneficiaire && map[beneficiaire]) || 0;
}

/**
 * Prix d'une ligne de réservation.
 * - Matériel à "tarif bénéficiaire" : prix forfaitaire selon le bénéficiaire.
 * - Sinon : prix × quantité si "exponentiel" (ex : 5 € le banc × 6),
 *   ou prix fixe quelle que soit la quantité (ex : 20 € le lot).
 */
export function lineItemPrice(item: {
  quantite: number;
  beneficiaire?: string | null;
  equipment: PricedEquipment;
}): number {
  if (item.equipment.tarifBeneficiaire) {
    return beneficiairePrice(item.equipment, item.beneficiaire);
  }
  return item.equipment.prixExponentiel
    ? item.equipment.prix * item.quantite
    : item.equipment.prix;
}

/**
 * Calcule le prix total de location d'une réservation à partir de ses lignes.
 */
export function reservationTotalPrice(
  items: {
    quantite: number;
    beneficiaire?: string | null;
    equipment: PricedEquipment;
  }[],
): number {
  return items.reduce((sum, it) => sum + lineItemPrice(it), 0);
}

/** Formate une date en français (ex: "samedi 19 juillet 2026") */
export function formatDateLongue(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/** Formate une date courte (ex: "19/07/2026") */
export function formatDateCourte(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}
