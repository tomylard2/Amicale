-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Equipment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "photoUrl" TEXT,
    "quantiteTotale" INTEGER NOT NULL DEFAULT 1,
    "caution" REAL,
    "prix" REAL NOT NULL DEFAULT 0,
    "prixExponentiel" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Equipment" ("caution", "createdAt", "description", "id", "isActive", "nom", "photoUrl", "quantiteTotale", "updatedAt") SELECT "caution", "createdAt", "description", "id", "isActive", "nom", "photoUrl", "quantiteTotale", "updatedAt" FROM "Equipment";
DROP TABLE "Equipment";
ALTER TABLE "new_Equipment" RENAME TO "Equipment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
