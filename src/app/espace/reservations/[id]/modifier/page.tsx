import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { DateRangePicker } from "@/components/reservation/date-range-picker";
import {
  ReservationBuilder,
  type BuilderItem,
} from "@/components/reservation/reservation-builder";
import { updateReservation } from "@/lib/actions/reservation";
import { computeAvailability } from "@/lib/availability";
import {
  isValidDateInput,
  parseDateInput,
  toDateInput,
  todayInput,
} from "@/lib/dates";
import { RESERVATION_STATUS, ROLES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Modifier la réservation",
};

export default async function ModifierReservationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ debut?: string; fin?: string }>;
}) {
  const { id } = await params;
  const { debut: qDebut, fin: qFin } = await searchParams;
  const session = await auth();

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!reservation) notFound();

  const isAdmin = session!.user.role === ROLES.ADMIN;
  if (reservation.userId !== session!.user.id && !isAdmin) notFound();

  const today = parseDateInput(todayInput());
  const modifiable =
    reservation.statut !== RESERVATION_STATUS.ANNULEE &&
    reservation.statut !== RESERVATION_STATUS.TERMINEE &&
    (isAdmin || reservation.dateDebut >= today);
  if (!modifiable) redirect(`/espace/reservations/${id}`);

  // Dates : override par l'URL si l'utilisateur en choisit d'autres,
  // sinon les dates actuelles de la réservation.
  const debut = isValidDateInput(qDebut)
    ? qDebut
    : toDateInput(reservation.dateDebut);
  const fin =
    isValidDateInput(qFin) && (qFin as string) >= debut
      ? qFin
      : toDateInput(reservation.dateFin);

  const availability = await computeAvailability(
    parseDateInput(debut),
    parseDateInput(fin),
    { excludeReservationId: id },
  );
  const items: BuilderItem[] = availability.map((a) => ({
    id: a.equipment.id,
    nom: a.equipment.nom,
    description: a.equipment.description,
    photoUrl: a.equipment.photoUrl,
    available: a.available,
    caution: a.equipment.caution,
    quantiteTotale: a.equipment.quantiteTotale,
    prix: a.equipment.prix,
    prixExponentiel: a.equipment.prixExponentiel,
  }));

  const initialQuantities: Record<string, number> = {};
  for (const it of reservation.items) {
    initialQuantities[it.equipmentId] = it.quantite;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link
          href={`/espace/reservations/${id}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Retour au détail
        </Link>
        <h1 className="text-2xl font-bold mt-2">Modifier la réservation</h1>
      </div>

      <Card className="p-5">
        <DateRangePicker
          defaultDebut={debut}
          defaultFin={fin}
          basePath={`/espace/reservations/${id}/modifier`}
        />
      </Card>

      <ReservationBuilder
        dateDebut={debut}
        dateFin={fin}
        items={items}
        action={updateReservation}
        reservationId={id}
        initialQuantities={initialQuantities}
        submitLabel="Enregistrer les modifications"
      />
    </div>
  );
}
