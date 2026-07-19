import nodemailer from "nodemailer";

// Transporteur SMTP Gmail en singleton (même logique que src/lib/prisma.ts).
const globalForMailer = globalThis as unknown as {
  mailer: nodemailer.Transporter | undefined;
};

function getTransporter() {
  if (!globalForMailer.mailer) {
    globalForMailer.mailer = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return globalForMailer.mailer;
}

type SendEmailParams = {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: { filename: string; content: Buffer; contentType?: string }[];
};

/**
 * Envoie un e-mail via Gmail SMTP. N'échoue jamais bruyamment : une erreur
 * d'envoi (Gmail indisponible, quota...) est loguée mais ne doit jamais
 * bloquer l'action métier (inscription, réservation...) qui l'a déclenchée.
 * Renvoie true/false pour les appelants qui ont besoin de savoir si l'envoi
 * a réussi (ex: envoi de facture, où l'admin doit être prévenu d'un échec).
 */
export async function sendEmail({
  to,
  subject,
  html,
  attachments,
}: SendEmailParams): Promise<boolean> {
  if (!process.env.GMAIL_APP_PASSWORD) {
    console.warn(`[email] GMAIL_APP_PASSWORD absent, e-mail non envoyé : "${subject}" à ${to}`);
    return false;
  }
  try {
    await getTransporter().sendMail({
      from: `Amicale Pompiers Châteaubourg <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
      attachments,
    });
    return true;
  } catch (error) {
    console.error(`[email] Échec d'envoi "${subject}" à ${to}`, error);
    return false;
  }
}

export function siteUrl() {
  return process.env.AUTH_URL || "http://localhost:3000";
}
