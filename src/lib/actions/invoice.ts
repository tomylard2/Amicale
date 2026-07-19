"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";
import { invoiceSchema, fieldErrorsFrom } from "@/lib/validations";
import { generateInvoicePdf } from "@/lib/pdf/generate-invoice-pdf";
import { sendEmail } from "@/lib/email";

export type InvoiceFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

/** Numéro séquentiel du type FACT-2026-001, réinitialisé chaque année. */
async function nextInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count({
    where: { numero: { startsWith: `FACT-${year}-` } },
  });
  return `FACT-${year}-${String(count + 1).padStart(3, "0")}`;
}

/** Création d'une facture (depuis une réservation existante ou en saisie libre). */
export async function createInvoice(
  _prevState: InvoiceFormState,
  formData: FormData,
): Promise<InvoiceFormState> {
  await requireAdmin();

  let items: unknown = [];
  try {
    items = JSON.parse(String(formData.get("itemsJson") ?? "[]"));
  } catch {
    items = [];
  }

  const parsed = invoiceSchema.safeParse({
    reservationId: formData.get("reservationId") || undefined,
    clientNom: formData.get("clientNom"),
    clientEmail: formData.get("clientEmail"),
    clientAdresse: formData.get("clientAdresse"),
    notes: formData.get("notes"),
    caution: formData.get("caution") || undefined,
    items,
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const numero = await nextInvoiceNumber();

  const invoice = await prisma.invoice.create({
    data: {
      numero,
      reservationId: parsed.data.reservationId || null,
      clientNom: parsed.data.clientNom,
      clientEmail: parsed.data.clientEmail,
      clientAdresse: parsed.data.clientAdresse || null,
      notes: parsed.data.notes || null,
      caution: parsed.data.caution ?? null,
      items: {
        create: parsed.data.items.map((it) => ({
          description: it.description,
          quantite: it.quantite,
          montant: it.montant,
        })),
      },
    },
  });

  revalidatePath("/admin/factures");
  redirect(`/admin/factures/${invoice.id}`);
}

export type SendInvoiceState = { error?: string; success?: boolean };

/** Génère le PDF et l'envoie par e-mail au client de la facture. */
export async function sendInvoiceEmail(
  _prevState: SendInvoiceState,
  formData: FormData,
): Promise<SendInvoiceState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!invoice) return { error: "Facture introuvable." };

  const pdf = await generateInvoicePdf({
    numero: invoice.numero,
    dateEmission: invoice.dateEmission,
    clientNom: invoice.clientNom,
    clientEmail: invoice.clientEmail,
    clientAdresse: invoice.clientAdresse,
    notes: invoice.notes,
    caution: invoice.caution,
    items: invoice.items,
  });

  const ok = await sendEmail({
    to: invoice.clientEmail,
    subject: `Facture ${invoice.numero} — Amicale des Sapeurs-Pompiers de Châteaubourg`,
    html: `
      <p>Bonjour,</p>
      <p>Veuillez trouver ci-joint votre facture n° ${invoice.numero}.</p>
      <p>Cordialement,<br/>Amicale des Sapeurs-Pompiers de Châteaubourg</p>
    `,
    attachments: [
      { filename: `${invoice.numero}.pdf`, content: pdf, contentType: "application/pdf" },
    ],
  });

  if (!ok) {
    return {
      error: "L'envoi a échoué (problème de connexion à Gmail). Réessayez dans un instant.",
    };
  }

  await prisma.invoice.update({ where: { id }, data: { sentAt: new Date() } });
  revalidatePath(`/admin/factures/${id}`);
  return { success: true };
}
