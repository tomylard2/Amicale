import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmReservationButton } from "@/components/admin/reservation-actions";
import { CancelReservationButton } from "@/components/reservation/cancel-reservation-button";
import {
  RESERVATION_STATUS,
  STATUS_LABELS,
  type ReservationStatus,
} from "@/lib/constants";
import { formatDateCourte, formatEuros } from "@/lib/utils";
import { isValidDateInput, parseDateInput } from "@/lib/dates";
import type { Prisma } from "@prisma/client";

export const metadata: Metadata = {
  title: "Gestion des réservations",
};

export default async function AdminReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string; userId?: string; date?: string }>;
}) {
  const { statut, userId, date } = await searchParams;

  const where: Prisma.ReservationWhereInput = {};
  if (statut && statut in STATUS_LABELS) {
    where.statut = statut;
  }
  if (userId) where.userId = userId;
  if (isValidDateInput(date)) {
    const d = parseDateInput(date);
    where.dateDebut = { lte: d };
    where.dateFin = { gte: d };
  }

  const [reservations, users] = await Promise.all([
    prisma.reservation.findMany({
      where,
      include: {
        user: true,
        items: { include: { equipment: true } },
      },
      orderBy: { dateDebut: "desc" },
    }),
    prisma.user.findMany({ orderBy: { nom: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Réservations</h1>
        <p className="text-muted-foreground mt-1">
          {reservations.length} réservation
          {reservations.length > 1 ? "s" : ""}
        </p>
      </div>

      {/* Filtres (formulaire GET, fonctionne sans JavaScript) */}
      <Card>
        <CardContent>
          <form
            method="get"
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end"
          >
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="statut">
                Statut
              </label>
              <select
                id="statut"
                name="statut"
                defaultValue={statut ?? ""}
                className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
              >
                <option value="">Tous</option>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="userId">
                Membre
              </label>
              <select
                id="userId"
                name="userId"
                defaultValue={userId ?? ""}
                className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
              >
                <option value="">Tous</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.prenom} {u.nom}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="date">
                Actives à la date
              </label>
              <input
                id="date"
                name="date"
                type="date"
                defaultValue={date ?? ""}
                className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Filtrer</Button>
              <Button asChild variant="outline" type="button">
                <Link href="/admin/reservations">Réinitialiser</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {reservations.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          Aucune réservation ne correspond à ces critères.
        </Card>
      ) : (
        <div className="space-y-3">
          {reservations.map((r) => {
            const cautionTotale = r.items.reduce(
              (sum, it) => sum + it.quantite * (it.equipment.caution ?? 0),
              0,
            );
            const modifiable =
              r.statut !== RESERVATION_STATUS.ANNULEE &&
              r.statut !== RESERVATION_STATUS.TERMINEE;
            return (
              <Card key={r.id}>
                <CardContent>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-medium">
                        {r.user.prenom} {r.user.nom}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Du {formatDateCourte(r.dateDebut)} au{" "}
                        {formatDateCourte(r.dateFin)}
                        {cautionTotale > 0 &&
                          ` · caution ${formatEuros(cautionTotale)}`}
                      </p>
                      <ul className="mt-2 text-sm text-muted-foreground">
                        {r.items.map((it) => (
                          <li key={it.id}>
                            {it.quantite} × {it.equipment.nom}
                          </li>
                        ))}
                      </ul>
                      {r.note && (
                        <p className="mt-1 text-sm italic text-muted-foreground">
                          « {r.note} »
                        </p>
                      )}
                    </div>
                    <StatusBadge
                      status={r.statut as ReservationStatus}
                      label={STATUS_LABELS[r.statut as ReservationStatus]}
                    />
                  </div>

                  <div className="mt-4 flex items-center gap-4 flex-wrap">
                    {r.statut === RESERVATION_STATUS.EN_ATTENTE && (
                      <ConfirmReservationButton id={r.id} />
                    )}
                    <Link
                      href={`/espace/reservations/${r.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Voir / modifier
                    </Link>
                    {modifiable && (
                      <CancelReservationButton
                        id={r.id}
                        className="text-sm text-danger hover:underline"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
