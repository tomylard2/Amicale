"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { reservationDatesSchema, fieldErrorsFrom } from "@/lib/validations";
import { requireApprovedUser } from "@/lib/auth-guards";
import { computeAvailability } from "@/lib/availability";
import { parseDateInput, todayInput } from "@/lib/dates";
import { RESERVATION_STATUS, ROLES } from "@/lib/constants";
import { sendEmail, siteUrl } from "@/lib/email";
import { formatDateLongue } from "@/lib/utils";

export type ReservationState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

/** Collecte les quantités demandées depuis le formulaire (champs qty_<id>). */
function collectDesiredItems(formData: FormData) {
  const desired: { equipmentId: string; quantite: number }[] = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("qty_")) continue;
    const quantite = Math.floor(Number(value));
    if (Number.isFinite(quantite) && quantite > 0) {
      desired.push({ equipmentId: key.slice(4), quantite });
    }
  }
  return desired;
}

/** Création d'une réservation (statut EN_ATTENTE) avec contrôle de stock. */
export async function createReservation(
  _prevState: ReservationState,
  formData: FormData,
): Promise<ReservationState> {
  const session = await requireApprovedUser();

  const debut = String(formData.get("dateDebut") ?? "");
  const fin = String(formData.get("dateFin") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  const parsed = reservationDatesSchema.safeParse({
    dateDebut: debut,
    dateFin: fin,
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const dateDebut = parseDateInput(debut);
  const dateFin = parseDateInput(fin);

  // Pas de réservation dans le passé
  if (dateDebut < parseDateInput(todayInput())) {
    return { error: "La date de début ne peut pas être dans le passé." };
  }

  const desired = collectDesiredItems(formData);
  if (desired.length === 0) {
    return { error: "Sélectionnez au moins un matériel." };
  }

  try {
    // Transaction : on revérifie les disponibilités AU MOMENT de créer,
    // ce qui empêche deux réservations concurrentes de dépasser le stock.
    await prisma.$transaction(async (tx) => {
      const availability = await computeAvailability(dateDebut, dateFin, {
        client: tx,
      });
      const byId = new Map(availability.map((a) => [a.equipment.id, a]));

      for (const d of desired) {
        const a = byId.get(d.equipmentId);
        if (!a) {
          throw new Error("Un matériel sélectionné n'est plus disponible.");
        }
        if (d.quantite > a.available) {
          throw new Error(
            `« ${a.equipment.nom} » : quantité demandée (${d.quantite}) supérieure au disponible (${a.available}) sur cette période.`,
          );
        }
      }

      await tx.reservation.create({
        data: {
          userId: session.user.id,
          dateDebut,
          dateFin,
          note: note || null,
          statut: RESERVATION_STATUS.EN_ATTENTE,
          items: {
            create: desired.map((d) => ({
              equipmentId: d.equipmentId,
              quantite: d.quantite,
            })),
          },
        },
      });
    });
  } catch (e) {
    return {
      error:
        e instanceof Error
          ? e.message
          : "Une erreur est survenue lors de la réservation.",
    };
  }

  revalidatePath("/espace/reservations");
  redirect("/espace/reservations?success=1");
}

/**
 * Modification d'une réservation existante. Autorisée au propriétaire tant
 * qu'elle n'a pas commencé (l'admin peut toujours modifier). Toute
 * modification par un membre repasse la réservation en attente de validation.
 */
export async function updateReservation(
  _prevState: ReservationState,
  formData: FormData,
): Promise<ReservationState> {
  const session = await requireApprovedUser();
  const isAdmin = session.user.role === ROLES.ADMIN;

  const id = String(formData.get("reservationId") ?? "");
  if (!id) return { error: "Réservation introuvable." };

  const existing = await prisma.reservation.findUnique({ where: { id } });
  if (!existing) return { error: "Réservation introuvable." };

  if (existing.userId !== session.user.id && !isAdmin) {
    return { error: "Accès non autorisé." };
  }
  if (existing.statut === RESERVATION_STATUS.ANNULEE) {
    return { error: "Cette réservation est annulée et ne peut pas être modifiée." };
  }

  const debut = String(formData.get("dateDebut") ?? "");
  const fin = String(formData.get("dateFin") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  const parsed = reservationDatesSchema.safeParse({
    dateDebut: debut,
    dateFin: fin,
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error) };

  const dateDebut = parseDateInput(debut);
  const dateFin = parseDateInput(fin);
  const today = parseDateInput(todayInput());

  if (!isAdmin && existing.dateDebut < today) {
    return {
      error: "Cette réservation a déjà commencé et ne peut plus être modifiée.",
    };
  }
  if (dateDebut < today) {
    return { error: "La date de début ne peut pas être dans le passé." };
  }

  const desired = collectDesiredItems(formData);
  if (desired.length === 0) {
    return { error: "Sélectionnez au moins un matériel." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // On exclut la réservation en cours de modification du calcul,
      // pour ne pas la compter contre elle-même.
      const availability = await computeAvailability(dateDebut, dateFin, {
        client: tx,
        excludeReservationId: id,
      });
      const byId = new Map(availability.map((a) => [a.equipment.id, a]));

      for (const d of desired) {
        const a = byId.get(d.equipmentId);
        if (!a) throw new Error("Un matériel sélectionné n'est plus disponible.");
        if (d.quantite > a.available) {
          throw new Error(
            `« ${a.equipment.nom} » : quantité demandée (${d.quantite}) supérieure au disponible (${a.available}) sur cette période.`,
          );
        }
      }

      await tx.reservationItem.deleteMany({ where: { reservationId: id } });
      await tx.reservation.update({
        where: { id },
        data: {
          dateDebut,
          dateFin,
          note: note || null,
          // Une modification par un membre nécessite une nouvelle validation
          statut: isAdmin ? existing.statut : RESERVATION_STATUS.EN_ATTENTE,
          items: {
            create: desired.map((d) => ({
              equipmentId: d.equipmentId,
              quantite: d.quantite,
            })),
          },
        },
      });
    });
  } catch (e) {
    return {
      error:
        e instanceof Error
          ? e.message
          : "Une erreur est survenue lors de la modification.",
    };
  }

  revalidatePath("/espace/reservations");
  revalidatePath(`/espace/reservations/${id}`);
  redirect(`/espace/reservations/${id}?updated=1`);
}

/** Annulation d'une réservation (par le propriétaire avant le début, ou l'admin). */
export async function cancelReservation(formData: FormData): Promise<void> {
  const session = await requireApprovedUser();
  const isAdmin = session.user.role === ROLES.ADMIN;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const existing = await prisma.reservation.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!existing) return;
  if (existing.userId !== session.user.id && !isAdmin) return;

  const today = parseDateInput(todayInput());
  if (!isAdmin && existing.dateDebut < today) return;
  if (existing.statut === RESERVATION_STATUS.ANNULEE) return;

  await prisma.reservation.update({
    where: { id },
    data: { statut: RESERVATION_STATUS.ANNULEE },
  });

  revalidatePath("/espace/reservations");
  revalidatePath(`/espace/reservations/${id}`);

  // Notifier le membre uniquement si c'est l'admin qui annule à sa place.
  if (isAdmin && existing.userId !== session.user.id) {
    await sendEmail({
      to: existing.user.email,
      subject: "Votre réservation a été annulée",
      html: `
        <p>Bonjour ${existing.user.prenom},</p>
        <p>Votre réservation du ${formatDateLongue(existing.dateDebut)} au ${formatDateLongue(existing.dateFin)} a été annulée par un administrateur.</p>
        <p><a href="${siteUrl()}/espace/reservations/${id}">Voir ma réservation</a></p>
      `,
    });
  }
}
