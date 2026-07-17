import { auth } from "@/auth";
import { ROLES } from "@/lib/constants";

/** Vérifie que l'appelant est administrateur. Lève une erreur sinon. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== ROLES.ADMIN) {
    throw new Error("Accès non autorisé.");
  }
  return session;
}

/** Vérifie que l'appelant est un membre approuvé (ou un admin). */
export async function requireApprovedUser() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Vous devez être connecté.");
  }
  if (session.user.role !== ROLES.ADMIN && !session.user.isApproved) {
    throw new Error("Votre compte n'est pas encore approuvé.");
  }
  return session;
}
