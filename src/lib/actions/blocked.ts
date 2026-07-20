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

/**
 * Crée une (ou plusieurs) période(s) d'indisponibilité : tout le matériel
 * (une seule ligne, equipmentId null), ou un matériel par ligne sélectionnée
 * dans "equipmentIds" (une ligne par matériel, mêmes dates/motif).
 */
export async function createBlockedPeriod(
  _prevState: BlockedState,
  formData: FormData,
): Promise<BlockedState> {
  await requireAdmin();

  const debut = String(formData.get("dateDebut") ?? "");
  const fin = String(formData.get("dateFin") ?? "");
  const motif = String(formData.get("motif") ?? "").trim();
  const scope = String(formData.get("scope") ?? "tout");
  const equipmentIds = formData.getAll("equipmentIds").map(String).filter(Boolean);

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
  if (scope === "specifique" && equipmentIds.length === 0) {
    return {
      fieldErrors: {
        equipmentIds: ["Sélectionnez au moins un matériel, ou cochez « Tout le matériel »."],
      },
    };
  }

  const dateDebut = parseDateInput(debut);
  const dateFin = parseDateInput(fin);

  if (scope === "tout") {
    await prisma.blockedPeriod.create({
      data: { dateDebut, dateFin, motif, equipmentId: null },
    });
  } else {
    await prisma.blockedPeriod.createMany({
      data: equipmentIds.map((equipmentId) => ({
        dateDebut,
        dateFin,
        motif,
        equipmentId,
      })),
    });
  }

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
