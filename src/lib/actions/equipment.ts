"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { equipmentSchema, fieldErrorsFrom } from "@/lib/validations";
import { requireAdmin } from "@/lib/auth-guards";
import { saveEquipmentImage, deleteEquipmentImage } from "@/lib/upload";

export type EquipmentFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

/** Extrait et valide les champs texte du formulaire matériel. */
function parseFields(formData: FormData) {
  return equipmentSchema.safeParse({
    nom: formData.get("nom"),
    description: formData.get("description"),
    quantiteTotale: formData.get("quantiteTotale"),
    caution: formData.get("caution") || undefined,
  });
}

/** Création d'un matériel */
export async function createEquipment(
  _prevState: EquipmentFormState,
  formData: FormData,
): Promise<EquipmentFormState> {
  await requireAdmin();

  const parsed = parseFields(formData);
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  const { nom, description, quantiteTotale, caution } = parsed.data;

  // Photo (facultative)
  let photoUrl: string | null = null;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const result = await saveEquipmentImage(photo);
    if (!result.ok) return { fieldErrors: { photo: [result.error] } };
    photoUrl = result.url;
  }

  await prisma.equipment.create({
    data: {
      nom,
      description: description || null,
      quantiteTotale,
      caution: caution ?? null,
      photoUrl,
    },
  });

  revalidatePath("/admin/materiel");
  redirect("/admin/materiel");
}

/** Modification d'un matériel */
export async function updateEquipment(
  _prevState: EquipmentFormState,
  formData: FormData,
): Promise<EquipmentFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Matériel introuvable." };

  const existing = await prisma.equipment.findUnique({ where: { id } });
  if (!existing) return { error: "Matériel introuvable." };

  const parsed = parseFields(formData);
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  const { nom, description, quantiteTotale, caution } = parsed.data;

  let photoUrl = existing.photoUrl;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const result = await saveEquipmentImage(photo);
    if (!result.ok) return { fieldErrors: { photo: [result.error] } };
    // Remplace l'ancienne image
    await deleteEquipmentImage(existing.photoUrl);
    photoUrl = result.url;
  }

  await prisma.equipment.update({
    where: { id },
    data: {
      nom,
      description: description || null,
      quantiteTotale,
      caution: caution ?? null,
      photoUrl,
    },
  });

  revalidatePath("/admin/materiel");
  redirect("/admin/materiel");
}

export type DeleteState = { error?: string };

/**
 * Suppression d'un matériel. Si le matériel a déjà été réservé, on ne le
 * supprime pas (intégrité de l'historique) : on invite à le désactiver.
 */
export async function deleteEquipment(
  _prevState: DeleteState,
  formData: FormData,
): Promise<DeleteState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Matériel introuvable." };

  const nbReservations = await prisma.reservationItem.count({
    where: { equipmentId: id },
  });
  if (nbReservations > 0) {
    return {
      error:
        "Ce matériel a déjà été réservé : il ne peut pas être supprimé. Vous pouvez le désactiver pour le retirer du catalogue.",
    };
  }

  const existing = await prisma.equipment.findUnique({ where: { id } });
  await prisma.equipment.delete({ where: { id } });
  await deleteEquipmentImage(existing?.photoUrl ?? null);

  revalidatePath("/admin/materiel");
  return {};
}

/** Active/désactive un matériel (le retire ou le remet au catalogue). */
export async function toggleEquipmentActive(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const existing = await prisma.equipment.findUnique({ where: { id } });
  if (!existing) return;

  await prisma.equipment.update({
    where: { id },
    data: { isActive: !existing.isActive },
  });

  revalidatePath("/admin/materiel");
}
