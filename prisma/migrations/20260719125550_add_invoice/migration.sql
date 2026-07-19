-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" TEXT NOT NULL,
    "reservationId" TEXT,
    "clientNom" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientAdresse" TEXT,
    "notes" TEXT,
    "caution" REAL,
    "dateEmission" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Invoice_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL DEFAULT 1,
    "montant" REAL NOT NULL,
    CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_numero_key" ON "Invoice"("numero");

-- CreateIndex
CREATE INDEX "Invoice_reservationId_idx" ON "Invoice"("reservationId");

-- CreateIndex
CREATE INDEX "InvoiceItem_invoiceId_idx" ON "InvoiceItem"("invoiceId");
