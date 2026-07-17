"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";
import { ROLES } from "@/lib/constants";
import { adminCreateUserSchema, fieldErrorsFrom } from "@/lib/validations";

export type CreateUserState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

/** Création manuelle d'un compte (membre ou admin) par un administrateur. */
export async function createUserByAdmin(
  _prevState: CreateUserState,
  formData: FormData,
): Promise<CreateUserState> {
  await requireAdmin();

  const parsed = adminCreateUserSchema.safeParse({
    prenom: formData.get("prenom"),
    nom: formData.get("nom"),
    email: formData.get("email"),
    telephone: formData.get("telephone"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  const { prenom, nom, email, telephone, password, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Un compte existe déjà avec cette adresse e-mail." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      prenom,
      nom,
      email,
      telephone: telephone ? telephone : null,
      passwordHash,
      role,
      // Compte créé par un admin : directement approuvé et actif
      isApproved: true,
      isActive: true,
    },
  });

  revalidatePath("/admin/utilisateurs");
  revalidatePath("/admin");
  redirect("/admin/utilisateurs");
}

/**
 * Change le rôle d'un utilisateur (Membre <-> Admin).
 * Sécurités : on ne modifie pas son propre rôle, et on ne retire jamais
 * le dernier administrateur.
 */
export async function setUserRole(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "");

  if (!id || (role !== ROLES.USER && role !== ROLES.ADMIN)) return;
  if (id === session.user.id) return; // pas soi-même

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return;

  if (target.role === ROLES.ADMIN && role === ROLES.USER) {
    const nbAdmins = await prisma.user.count({ where: { role: ROLES.ADMIN } });
    if (nbAdmins <= 1) return; // garder au moins un admin
  }

  await prisma.user.update({
    where: { id },
    // Un admin est nécessairement approuvé
    data: { role, isApproved: role === ROLES.ADMIN ? true : target.isApproved },
  });
  revalidatePath("/admin/utilisateurs");
  revalidatePath("/admin");
}

/** Approuve un compte membre en attente. */
export async function approveUser(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.user.update({
    where: { id },
    data: { isApproved: true, isActive: true },
  });
  revalidatePath("/admin/utilisateurs");
  revalidatePath("/admin");
}

/** Active / désactive un compte membre. */
export async function toggleUserActive(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id || id === session.user.id) return; // pas soi-même

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.role === ROLES.ADMIN) return; // pas un autre admin

  await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
  });
  revalidatePath("/admin/utilisateurs");
}

export type DeleteUserState = { error?: string };

/** Supprime un compte membre (et ses réservations, en cascade). */
export async function deleteUser(
  _prevState: DeleteUserState,
  formData: FormData,
): Promise<DeleteUserState> {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Utilisateur introuvable." };
  if (id === session.user.id) {
    return { error: "Vous ne pouvez pas supprimer votre propre compte." };
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return { error: "Utilisateur introuvable." };
  if (user.role === ROLES.ADMIN) {
    return { error: "Un compte administrateur ne peut pas être supprimé ici." };
  }

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/utilisateurs");
  revalidatePath("/admin");
  return {};
}
