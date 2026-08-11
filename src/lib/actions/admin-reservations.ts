"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";
import { RESERVATION_STATUS, BENEFICIAIRE_LABELS, type Beneficiaire } from "@/lib/constants";
import { sendEmail, siteUrl } from "@/lib/email";
import { formatDateLongue, lineItemPrice } from "@/lib/utils";
import { generateVoucherPdf } from "@/lib/pdf/generate-voucher-pdf";

/** Libellé enrichi d'une ligne (matériel + bénéficiaire + options) pour le bon. */
function voucherItemLabel(it: {
  equipment: { nom: string };
  beneficiaire: string | null;
  optionsChoisies: string | null;
}): string {
  let label = it.equipment.nom;
  if (it.beneficiaire) {
    label += ` (${BENEFICIAIRE_LABELS[it.beneficiaire as Beneficiaire] ?? it.beneficiaire})`;
  }
  if (it.optionsChoisies) {
    try {
      const opts = JSON.parse(it.optionsChoisies);
      if (Array.isArray(opts) && opts.length > 0) {
        label += ` — options : ${opts.join(", ")}`;
      }
    } catch {
      // ignore
    }
  }
  return label;
}

/** Confirme (accepte) une réservation en attente. */
export async function confirmReservation(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { user: true, items: { include: { equipment: true } } },
  });
  if (!reservation) return;
  if (reservation.statut !== RESERVATION_STATUS.EN_ATTENTE) return;

  await prisma.reservation.update({
    where: { id },
    data: { statut: RESERVATION_STATUS.CONFIRMEE },
  });
  revalidatePath("/admin/reservations");
  revalidatePath(`/espace/reservations/${id}`);
  revalidatePath("/admin");

  const cautionTotale = reservation.items.reduce(
    (sum, it) => sum + it.quantite * (it.equipment.caution ?? 0),
    0,
  );
  const voucherPdf = await generateVoucherPdf({
    reservationId: reservation.id,
    dateDebut: reservation.dateDebut,
    dateFin: reservation.dateFin,
    memberNom: `${reservation.user.prenom} ${reservation.user.nom}`,
    memberEmail: reservation.user.email,
    items: reservation.items.map((it) => ({
      nom: voucherItemLabel(it),
      quantite: it.quantite,
      montant: lineItemPrice(it),
    })),
    caution: cautionTotale,
  });

  await sendEmail({
    to: reservation.user.email,
    subject: "Votre réservation est confirmée",
    html: `
      <p>Bonjour ${reservation.user.prenom},</p>
      <p>Votre réservation du ${formatDateLongue(reservation.dateDebut)} au ${formatDateLongue(reservation.dateFin)} vient d'être confirmée par un administrateur.</p>
      <p>Vous trouverez ci-joint votre bon de réservation.</p>
      <p><a href="${siteUrl()}/espace/reservations/${id}">Voir ma réservation</a></p>
    `,
    attachments: [
      {
        filename: `bon-reservation-${reservation.id.slice(-8)}.pdf`,
        content: voucherPdf,
        contentType: "application/pdf",
      },
    ],
  });
}

export type DeleteReservationState = { error?: string };

/**
 * Supprime définitivement une réservation (nettoyage de tests, doublons...).
 * Réservée aux réservations déjà annulées ou terminées, pour éviter de
 * supprimer par erreur une réservation encore active : il faut d'abord
 * l'annuler.
 */
export async function deleteReservation(
  _prevState: DeleteReservationState,
  formData: FormData,
): Promise<DeleteReservationState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Réservation introuvable." };

  const reservation = await prisma.reservation.findUnique({ where: { id } });
  if (!reservation) return { error: "Réservation introuvable." };
  if (
    reservation.statut !== RESERVATION_STATUS.ANNULEE &&
    reservation.statut !== RESERVATION_STATUS.TERMINEE
  ) {
    return {
      error: "Annulez d'abord la réservation avant de pouvoir la supprimer.",
    };
  }

  await prisma.reservation.delete({ where: { id } });
  revalidatePath("/admin/reservations");
  revalidatePath("/espace/reservations");
  revalidatePath("/admin");
  return {};
}
