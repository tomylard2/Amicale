// Sauvegarde quotidienne de la base SQLite de production, avec purge des
// sauvegardes de plus de 35 jours et envoi mensuel par e-mail (le 1er).
// Prévu pour être lancé par une tâche planifiée (cron), en dehors de npm,
// avec les variables d'environnement fournies directement sur la ligne de
// commande (DATABASE_URL, GMAIL_USER, GMAIL_APP_PASSWORD, BACKUP_EMAIL) —
// les variables de "Setup Node.js App" ne sont pas disponibles hors de
// l'application elle-même.
// Usage : node scripts/backup-db.mjs
import {
  copyFileSync,
  mkdirSync,
  readdirSync,
  statSync,
  unlinkSync,
} from "node:fs";
import path from "node:path";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl || !dbUrl.startsWith("file:")) {
  console.error("DATABASE_URL absent ou invalide (doit commencer par file:).");
  process.exit(1);
}
const dbPath = dbUrl.replace(/^file:/, "");
const backupDir = path.join(path.dirname(dbPath), "backups");
mkdirSync(backupDir, { recursive: true });

const today = new Date();
const stamp = today.toISOString().slice(0, 10); // YYYY-MM-DD
const backupPath = path.join(backupDir, `prod-${stamp}.db`);

copyFileSync(dbPath, backupPath);
console.log("Sauvegarde créée :", backupPath);

// Purge des sauvegardes de plus de 35 jours.
const RETENTION_DAYS = 35;
const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
for (const file of readdirSync(backupDir)) {
  const filePath = path.join(backupDir, file);
  if (statSync(filePath).mtimeMs < cutoff) {
    unlinkSync(filePath);
    console.log("Ancienne sauvegarde supprimée :", file);
  }
}

// Envoi mensuel par e-mail, le 1er du mois uniquement.
if (today.getDate() === 1) {
  if (!process.env.BACKUP_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
    console.log(
      "BACKUP_EMAIL ou GMAIL_APP_PASSWORD absent : envoi mensuel ignoré.",
    );
  } else {
    const { default: nodemailer } = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
    await transporter.sendMail({
      from: `Amicale Pompiers Châteaubourg <${process.env.GMAIL_USER}>`,
      to: process.env.BACKUP_EMAIL,
      subject: `Sauvegarde mensuelle de la base de données — ${stamp}`,
      html: "<p>Sauvegarde automatique mensuelle de la base de données du site, en pièce jointe.</p>",
      attachments: [{ filename: `prod-${stamp}.db`, path: backupPath }],
    });
    console.log("Sauvegarde envoyée par e-mail à", process.env.BACKUP_EMAIL);
  }
}
