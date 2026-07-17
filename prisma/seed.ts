import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient();

/**
 * Crée (ou met à jour) le premier compte administrateur.
 * Identifiants configurables via .env : ADMIN_EMAIL et ADMIN_PASSWORD.
 * Le mot de passe n'est défini qu'à la création : re-lancer le seed
 * n'écrase pas un mot de passe déjà changé.
 */
async function main() {
  const email = (
    process.env.ADMIN_EMAIL || "admin@amicale-chateaubourg.fr"
  ).toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Admin1234!";
  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      role: "ADMIN",
      isApproved: true,
      isActive: true,
    },
    create: {
      email,
      prenom: "Admin",
      nom: "Amicale",
      passwordHash,
      role: "ADMIN",
      isApproved: true,
      isActive: true,
    },
  });

  console.log("──────────────────────────────────────────────");
  console.log("✅ Administrateur prêt");
  console.log(`   E-mail       : ${admin.email}`);
  console.log(`   Mot de passe : ${password}`);
  console.log("   ⚠️  Pensez à changer ce mot de passe après connexion.");
  console.log("──────────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
