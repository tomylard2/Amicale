import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

/**
 * Données de démonstration (matériel). Utile en développement pour tester
 * le catalogue et les réservations. Idempotent : n'ajoute que ce qui manque.
 * Lancer avec : npx tsx prisma/seed-demo.ts
 */
const demoMateriels = [
  {
    nom: "Banc pliant",
    description: "Banc en bois pliant, 2 mètres, assise 4 personnes.",
    quantiteTotale: 40,
    caution: 5,
  },
  {
    nom: "Tonnelle 3x3 m",
    description: "Tonnelle pliante 3x3 m avec bâches latérales.",
    quantiteTotale: 6,
    caution: 50,
  },
  {
    nom: "Enceinte sono",
    description: "Enceinte amplifiée 500 W sur batterie, avec micro sans fil.",
    quantiteTotale: 2,
    caution: 100,
  },
  {
    nom: "Percolateur à café",
    description: "Percolateur 100 tasses, idéal pour les événements.",
    quantiteTotale: 3,
    caution: 20,
  },
];

async function main() {
  for (const m of demoMateriels) {
    const exists = await prisma.equipment.findFirst({ where: { nom: m.nom } });
    if (!exists) {
      await prisma.equipment.create({ data: m });
      console.log(`+ ajouté : ${m.nom}`);
    } else {
      console.log(`= déjà présent : ${m.nom}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
