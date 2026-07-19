import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { InvoiceForm } from "@/components/admin/invoice-form";

export const metadata: Metadata = {
  title: "Nouvelle facture",
};

export default async function NouvelleFacturePage({
  searchParams,
}: {
  searchParams: Promise<{ reservationId?: string }>;
}) {
  const { reservationId } = await searchParams;

  let initialClientNom: string | undefined;
  let initialClientEmail: string | undefined;
  let initialItems:
    | { description: string; quantite: number; montant: number }[]
    | undefined;

  if (reservationId) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { user: true, items: { include: { equipment: true } } },
    });
    if (!reservation) notFound();

    initialClientNom = `${reservation.user.prenom} ${reservation.user.nom}`;
    initialClientEmail = reservation.user.email;
    initialItems = reservation.items.map((it) => ({
      description: it.equipment.nom,
      quantite: it.quantite,
      montant: 0,
    }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nouvelle facture</h1>
        <p className="text-muted-foreground mt-1">
          {reservationId
            ? "Les lignes ont été pré-remplies depuis la réservation ; pensez à saisir les montants."
            : "Saisissez les informations du client et les lignes de la facture."}
        </p>
      </div>

      <InvoiceForm
        reservationId={reservationId}
        initialClientNom={initialClientNom}
        initialClientEmail={initialClientEmail}
        initialItems={initialItems}
      />
    </div>
  );
}
