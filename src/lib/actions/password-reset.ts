"use server";

import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendEmail, siteUrl } from "@/lib/email";
import {
  requestPasswordResetSchema,
  resetPasswordSchema,
  fieldErrorsFrom,
} from "@/lib/validations";

const TOKEN_VALIDITY_MS = 60 * 60 * 1000; // 1 heure

export type RequestResetState = {
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

/**
 * Envoie un lien de réinitialisation par e-mail si le compte existe.
 * Répond toujours "success" (même si l'e-mail est inconnu) pour ne pas
 * révéler quelles adresses sont enregistrées.
 */
export async function requestPasswordReset(
  _prevState: RequestResetState,
  formData: FormData,
): Promise<RequestResetState> {
  const parsed = requestPasswordResetSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (user) {
    const token = randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + TOKEN_VALIDITY_MS),
      },
    });

    const link = `${siteUrl()}/reinitialiser-mot-de-passe/${token}`;
    await sendEmail({
      to: user.email,
      subject: "Réinitialisation de votre mot de passe",
      html: `
        <p>Bonjour ${user.prenom},</p>
        <p>Vous avez demandé à réinitialiser votre mot de passe sur le site de l'Amicale des Pompiers de Châteaubourg.</p>
        <p><a href="${link}">Cliquez ici pour choisir un nouveau mot de passe</a></p>
        <p>Ce lien est valable 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>
      `,
    });
  }

  return { success: true };
}

export type ResetPasswordState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

/** Applique le nouveau mot de passe si le jeton est valide et non expiré. */
export async function resetPassword(
  _prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: parsed.data.token },
  });

  if (
    !resetToken ||
    resetToken.usedAt ||
    resetToken.expiresAt < new Date()
  ) {
    return {
      error:
        "Ce lien de réinitialisation est invalide ou a expiré. Refaites une demande.",
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return { success: true };
}
