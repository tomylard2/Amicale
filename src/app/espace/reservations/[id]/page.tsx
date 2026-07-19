import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { CancelReservationButton } from "@/components/reservation/cancel-reservation-button";
import {
  STATUS_LABELS,
  RESERVATION_STATUS,
  ROLES,
  type ReservationStatus,
} from "@/lib/constants";
import { formatDateLongue, formatEuros } from "@/lib/utils";
import { parseDateInput, todayInput } from "@/lib/dates";

export const metadata: Metadata = {
  title: "Détail de la réservation",
};

export default async function ReservationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ updated?: string }>;
}) {
  const { id } = await params;
  const { updated } = await searchParams;
  const session = await auth();

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { items: { include: { equipment: true } } },
  });
  if (!reservation) notFound();

  const isAdmin = session!.user.role === ROLES.ADMIN;
  if (reservation.userId !== session!.user.id && !isAdmin) notFound();

  const today = parseDateInput(todayInput());
  const modifiable =
    reservation.statut !== RESERVATION_STATUS.ANNULEE &&
    reservation.statut !== RESERVATION_STATUS.TERMINEE &&
    reservation.dateDebut >= today;

  const cautionTotale = reservation.items.reduce(
    (sum, it) => sum + it.quantite * (it.equipment.caution ?? 0),
    0,
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link
          href="/espace/reservations"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Retour à mes réservations
        </Link>
      </div>

      {updated && (
        <p className="rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3">
          ✅ Votre réservation a été mise à jour.
        </p>
      )}

      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-bold">Réservation</h1>
              <p className="text-muted-foreground mt-1">
                Du {formatDateLongue(reservation.dateDebut)} au{" "}
                {formatDateLongue(reservation.dateFin)}
              </p>
            </div>
            <StatusBadge
              status={reservation.statut as ReservationStatus}
              label={STATUS_LABELS[reservation.statut as ReservationStatus]}
            />
          </div>

          <div className="border-t border-border pt-4">
            <h2 className="text-sm font-medium mb-2">Matériel réservé</h2>
            <ul className="space-y-2">
              {reservation.items.map((it) => (
                <li key={it.id} className="flex items-center gap-3">
                  {it.equipment.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={it.equipment.photoUrl}
                      alt={it.equipment.nom}
                      className="h-10 w-10 rounded object-cover border border-border"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded bg-muted grid place-items-center">
                      📦
                    </div>
                  )}
                  <span className="flex-1 text-sm">{it.equipment.nom}</span>
                  <span className="text-sm font-medium">× {it.quantite}</span>
                </li>
              ))}
            </ul>
          </div>

          {cautionTotale > 0 && (
            <p className="text-sm text-muted-foreground">
              Caution totale : {formatEuros(cautionTotale)}
            </p>
          )}
          {reservation.note && (
            <p className="text-sm text-muted-foreground italic border-t border-border pt-4">
              « {reservation.note} »
            </p>
          )}
        </CardContent>
      </Card>

      {modifiable ? (
        <div className="flex items-center gap-3 flex-wrap">
          <Button asChild variant="outline">
            <Link href={`/espace/reservations/${reservation.id}/modifier`}>
              Modifier
            </Link>
          </Button>
          <CancelReservationButton id={reservation.id} />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {reservation.statut === RESERVATION_STATUS.ANNULEE
            ? "Cette réservation a été annulée."
            : "Cette réservation ne peut plus être modifiée (déjà commencée ou terminée)."}
        </p>
      )}

      {isAdmin && (
        <div className="border-t border-border pt-4">
          <Button asChild variant="outline">
            <Link href={`/admin/factures/nouvelle?reservationId=${reservation.id}`}>
              Créer une facture pour cette réservation
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
