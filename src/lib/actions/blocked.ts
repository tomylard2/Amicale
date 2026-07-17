"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";
import { reservationDatesSchema, fieldErrorsFrom } from "@/lib/validations";
import { parseDateInput } from "@/lib/dates";

export type BlockedState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

/** Crée une période d'indisponibilité (tout le matériel ou un seul). */
export async function createBlockedPeriod(
  _prevState: BlockedState,
  formData: FormData,
): Promise<BlockedState> {
  await requireAdmin();

  const debut = String(formData.get("dateDebut") ?? "");
  const fin = String(formData.get("dateFin") ?? "");
  const motif = String(formData.get("motif") ?? "").trim();
  const equipmentIdRaw = String(formData.get("equipmentId") ?? "");

  const parsed = reservationDatesSchema.safeParse({
    dateDebut: debut,
    dateFin: fin,
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  if (motif.length < 2) {
    return { fieldErrors: { motif: ["Le motif est requis."] } };
  }

  await prisma.blockedPeriod.create({
    data: {
      dateDebut: parseDateInput(debut),
      dateFin: parseDateInput(fin),
      motif,
      equipmentId: equipmentIdRaw ? equipmentIdRaw : null,
    },
  });

  revalidatePath("/admin/indisponibilites");
  return { success: true };
}

/** Supprime une période d'indisponibilité. */
export async function deleteBlockedPeriod(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.blockedPeriod.delete({ where: { id } });
  revalidatePath("/admin/indisponibilites");
}
