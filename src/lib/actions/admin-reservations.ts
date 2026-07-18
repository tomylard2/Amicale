"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";
import { RESERVATION_STATUS } from "@/lib/constants";
import { sendEmail, siteUrl } from "@/lib/email";
import { formatDateLongue } from "@/lib/utils";

/** Confirme (accepte) une réservation en attente. */
export async function confirmReservation(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { user: true },
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

  await sendEmail({
    to: reservation.user.email,
    subject: "Votre réservation est confirmée",
    html: `
      <p>Bonjour ${reservation.user.prenom},</p>
      <p>Votre réservation du ${formatDateLongue(reservation.dateDebut)} au ${formatDateLongue(reservation.dateFin)} vient d'être confirmée par un administrateur.</p>
      <p><a href="${siteUrl()}/espace/reservations/${id}">Voir ma réservation</a></p>
    `,
  });
}
