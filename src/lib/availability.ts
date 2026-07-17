import { prisma } from "@/lib/prisma";
import { ACTIVE_RESERVATION_STATUSES } from "@/lib/constants";
import type { Prisma, PrismaClient, Equipment } from "@prisma/client";

// Accepte le client Prisma normal OU un client de transaction.
type Client = PrismaClient | Prisma.TransactionClient;

export type EquipmentAvailability = {
  equipment: Equipment;
  reserved: number; // quantité déjà réservée sur la période
  available: number; // quantité encore disponible
  blocked: boolean; // indisponible car période bloquée
};

/**
 * Calcule, pour chaque matériel actif, la quantité disponible sur la
 * période [dateDebut, dateFin] (bornes incluses).
 *
 * Règle : une réservation "consomme" du stock si elle chevauche la période
 * et n'est pas annulée. Chevauchement = (debut <= finDemandée) ET
 * (fin >= debutDemandé). Approche prudente : tout chevauchement bloque la
 * quantité sur toute la fenêtre demandée (simple et sûr).
 *
 * `excludeReservationId` permet, lors de la MODIFICATION d'une réservation,
 * de ne pas la compter contre elle-même.
 */
export async function computeAvailability(
  dateDebut: Date,
  dateFin: Date,
  options?: { excludeReservationId?: string; client?: Client },
): Promise<EquipmentAvailability[]> {
  const client = options?.client ?? prisma;

  const equipments = await client.equipment.findMany({
    where: { isActive: true },
    orderBy: { nom: "asc" },
  });

  // Lignes de réservation qui chevauchent la période (statuts actifs)
  const items = await client.reservationItem.findMany({
    where: {
      reservation: {
        statut: { in: ACTIVE_RESERVATION_STATUSES },
        dateDebut: { lte: dateFin },
        dateFin: { gte: dateDebut },
        ...(options?.excludeReservationId
          ? { id: { not: options.excludeReservationId } }
          : {}),
      },
    },
    select: { equipmentId: true, quantite: true },
  });

  const reservedByEquipment = new Map<string, number>();
  for (const it of items) {
    reservedByEquipment.set(
      it.equipmentId,
      (reservedByEquipment.get(it.equipmentId) ?? 0) + it.quantite,
    );
  }

  // Périodes d'indisponibilité qui chevauchent la demande
  const blocks = await client.blockedPeriod.findMany({
    where: { dateDebut: { lte: dateFin }, dateFin: { gte: dateDebut } },
    select: { equipmentId: true },
  });
  const globalBlocked = blocks.some((b) => b.equipmentId === null);
  const blockedIds = new Set(
    blocks
      .map((b) => b.equipmentId)
      .filter((id): id is string => id !== null),
  );

  return equipments.map((equipment) => {
    const reserved = reservedByEquipment.get(equipment.id) ?? 0;
    const blocked = globalBlocked || blockedIds.has(equipment.id);
    const available = blocked
      ? 0
      : Math.max(0, equipment.quantiteTotale - reserved);
    return { equipment, reserved, available, blocked };
  });
}
