import { z } from "zod";

/** Convertit les erreurs Zod en dictionnaire { champ: [messages] } */
export function fieldErrorsFrom(error: z.ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path[0]?.toString() ?? "_";
    (out[key] ??= []).push(issue.message);
  }
  return out;
}

/** Validation du formulaire de connexion */
export const loginSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/** Validation du formulaire d'inscription */
export const registerSchema = z
  .object({
    prenom: z.string().trim().min(2, "Le prénom est requis"),
    nom: z.string().trim().min(2, "Le nom est requis"),
    email: z.string().trim().toLowerCase().email("Adresse e-mail invalide"),
    telephone: z
      .string()
      .trim()
      .regex(
        /^(?:(?:\+33|0)[1-9](?:[\s.-]?\d{2}){4})?$/,
        "Numéro de téléphone invalide",
      )
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

/** Validation de la création d'un membre par un administrateur */
export const adminCreateUserSchema = z.object({
  prenom: z.string().trim().min(2, "Le prénom est requis"),
  nom: z.string().trim().min(2, "Le nom est requis"),
  email: z.string().trim().toLowerCase().email("Adresse e-mail invalide"),
  telephone: z
    .string()
    .trim()
    .regex(
      /^(?:(?:\+33|0)[1-9](?:[\s.-]?\d{2}){4})?$/,
      "Numéro de téléphone invalide",
    )
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  role: z.enum(["USER", "ADMIN"], { message: "Rôle invalide" }),
});

export type AdminCreateUserInput = z.infer<typeof adminCreateUserSchema>;

/** Validation de la demande de réinitialisation de mot de passe */
export const requestPasswordResetSchema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse e-mail invalide"),
});

/** Validation du choix d'un nouveau mot de passe */
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

/** Validation des données d'un matériel (hors photo, gérée séparément) */
export const equipmentSchema = z.object({
  nom: z.string().trim().min(2, "Le nom est requis"),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  quantiteTotale: z.coerce
    .number({ message: "Quantité invalide" })
    .int("La quantité doit être un nombre entier")
    .min(1, "La quantité doit être d'au moins 1"),
  caution: z.coerce
    .number({ message: "Caution invalide" })
    .min(0, "La caution ne peut pas être négative")
    .optional(),
});

export type EquipmentInput = z.infer<typeof equipmentSchema>;

/** Validation des dates d'une réservation (format "YYYY-MM-DD") */
export const reservationDatesSchema = z
  .object({
    dateDebut: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date de début invalide"),
    dateFin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date de fin invalide"),
  })
  .refine((d) => d.dateFin >= d.dateDebut, {
    message: "La date de fin doit être postérieure ou égale à la date de début",
    path: ["dateFin"],
  });
