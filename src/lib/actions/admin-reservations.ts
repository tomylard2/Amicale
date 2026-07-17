"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";
import { RESERVATION_STATUS } from "@/lib/constants";

/** Confirme (accepte) une réservation en attente. */
export async function confirmReservation(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const reservation = await prisma.reservation.findUnique({ where: { id } });
  if (!reservation) return;
  if (reservation.statut !== RESERVATION_STATUS.EN_ATTENTE) return;

  await prisma.reservation.update({
    where: { id },
    data: { statut: RESERVATION_STATUS.CONFIRMEE },
  });
  revalidatePath("/admin/reservations");
  revalidatePath(`/espace/reservations/${id}`);
  revalidatePath("/admin");
}
