import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ConfirmReservationButton,
  DeleteReservationButton,
} from "@/components/admin/reservation-actions";
import { CancelReservationButton } from "@/components/reservation/cancel-reservation-button";
import {
  ReservationsCalendar,
  type DayEquipmentSummary,
} from "@/components/admin/reservations-calendar";
import {
  RESERVATION_STATUS,
  STATUS_LABELS,
  ACTIVE_RESERVATION_STATUSES,
  type ReservationStatus,
} from "@/lib/constants";
import { formatDateCourte, formatEuros } from "@/lib/utils";
import { isValidDateInput, parseDateInput } from "@/lib/dates";
import type { Prisma } from "@prisma/client";

export const metadata: Metadata = {
  title: "Gestion des réservations",
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function buildViewHref(
  filters: { statut?: string; userId?: string; date?: string },
  vue: "liste" | "calendrier",
  mois?: string,
) {
  const params = new URLSearchParams();
  if (filters.statut) params.set("statut", filters.statut);
  if (filters.userId) params.set("userId", filters.userId);
  if (vue === "liste" && filters.date) params.set("date", filters.date);
  if (vue === "calendrier") {
    params.set("vue", "calendrier");
    if (mois) params.set("mois", mois);
  }
  const qs = params.toString();
  return `/admin/reservations${qs ? `?${qs}` : ""}`;
}

export default async function AdminReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    statut?: string;
    userId?: string;
    date?: string;
    vue?: string;
    mois?: string;
  }>;
}) {
  const { statut, userId, date, vue, mois } = await searchParams;
  const vueCalendrier = vue === "calendrier";

  const now = new Date();
  const moisValide = mois && /^\d{4}-\d{2}$/.test(mois);
  const year = moisValide ? Number(mois!.slice(0, 4)) : now.getFullYear();
  const monthIndex = moisValide ? Number(mois!.slice(5, 7)) - 1 : now.getMonth();

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

  // Vue calendrier : agrège le matériel réservé par jour sur le mois affiché.
  const byDay = new Map<string, DayEquipmentSummary>();
  if (vueCalendrier) {
    const monthStart = new Date(year, monthIndex, 1);
    const monthEnd = new Date(year, monthIndex + 1, 0);
    const calendarWhere: Prisma.ReservationWhereInput = {
      statut: { in: ACTIVE_RESERVATION_STATUSES },
      dateDebut: { lte: monthEnd },
      dateFin: { gte: monthStart },
    };
    if (statut && statut in STATUS_LABELS) calendarWhere.statut = statut;
    if (userId) calendarWhere.userId = userId;

    const monthReservations = await prisma.reservation.findMany({
      where: calendarWhere,
      include: { items: { include: { equipment: true } } },
    });

    const daysInMonth = monthEnd.getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const day = new Date(year, monthIndex, d);
      const key = `${year}-${pad(monthIndex + 1)}-${pad(d)}`;
      const perEquipment = new Map<string, number>();
      for (const r of monthReservations) {
        if (r.dateDebut > day || r.dateFin < day) continue;
        for (const it of r.items) {
          perEquipment.set(
            it.equipment.nom,
            (perEquipment.get(it.equipment.nom) ?? 0) + it.quantite,
          );
        }
      }
      if (perEquipment.size > 0) {
        byDay.set(
          key,
          Array.from(perEquipment.entries()).map(([nom, quantite]) => ({
            nom,
            quantite,
          })),
        );
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Réservations</h1>
          <p className="text-muted-foreground mt-1">
            {reservations.length} réservation
            {reservations.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-border overflow-hidden text-sm">
          <Link
            href={buildViewHref({ statut, userId, date }, "liste")}
            className={`px-3 py-1.5 ${!vueCalendrier ? "bg-primary text-white" : "hover:bg-muted"}`}
          >
            Vue liste
          </Link>
          <Link
            href={buildViewHref({ statut, userId, date }, "calendrier", mois)}
            className={`px-3 py-1.5 ${vueCalendrier ? "bg-primary text-white" : "hover:bg-muted"}`}
          >
            Vue calendrier
          </Link>
        </div>
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

      {vueCalendrier ? (
        <ReservationsCalendar
          year={year}
          monthIndex={monthIndex}
          byDay={byDay}
          baseQuery={{ statut, userId }}
        />
      ) : reservations.length === 0 ? (
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
                    {!modifiable && <DeleteReservationButton id={r.id} />}
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
