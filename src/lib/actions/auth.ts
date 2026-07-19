"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema, fieldErrorsFrom } from "@/lib/validations";
import { ROLES } from "@/lib/constants";
import { sendEmail, siteUrl } from "@/lib/email";

export type RegisterState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

/** Inscription d'un nouveau membre (compte en attente d'approbation admin) */
export async function registerAction(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const raw = {
    prenom: formData.get("prenom"),
    nom: formData.get("nom"),
    email: formData.get("email"),
    telephone: formData.get("telephone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const { prenom, nom, email, telephone, password } = parsed.data;

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
      role: ROLES.USER,
      isApproved: false,
      isActive: true,
    },
  });

  if (process.env.SIGNUP_ALERT_EMAIL) {
    await sendEmail({
      to: process.env.SIGNUP_ALERT_EMAIL,
      subject: "Nouvelle inscription à valider",
      html: `
        <p>${prenom} ${nom} (${email}) vient de créer un compte et attend une validation.</p>
        <p><a href="${siteUrl()}/admin/utilisateurs">Voir les comptes en attente</a></p>
      `,
    });
  }

  return { success: true };
}
