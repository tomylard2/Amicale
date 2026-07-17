import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import {
  ROLES,
  RESERVATION_STATUS,
  ACTIVE_RESERVATION_STATUSES,
  STATUS_LABELS,
  type ReservationStatus,
} from "@/lib/constants";
import { getUpcomingWeekend } from "@/lib/dates";
import { formatDateCourte } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const { samedi, dimanche } = getUpcomingWeekend();

  const [nbAApprouver, nbEnAttente, nbMateriel, reservationsWeekend] =
    await Promise.all([
      prisma.user.count({ where: { role: ROLES.USER, isApproved: false } }),
      prisma.reservation.count({
        where: { statut: RESERVATION_STATUS.EN_ATTENTE },
      }),
      prisma.equipment.count({ where: { isActive: true } }),
      prisma.reservation.findMany({
        where: {
          statut: { in: ACTIVE_RESERVATION_STATUSES },
          dateDebut: { lte: dimanche },
          dateFin: { gte: samedi },
        },
        include: { user: true, items: { include: { equipment: true } } },
        orderBy: { dateDebut: "asc" },
      }),
    ]);

  const stats = [
    {
      label: "Comptes à approuver",
      value: nbAApprouver,
      href: "/admin/utilisateurs",
    },
    {
      label: "Réservations en attente",
      value: nbEnAttente,
      href: "/admin/reservations?statut=EN_ATTENTE",
    },
    {
      label: "Matériels au catalogue",
      value: nbMateriel,
      href: "/admin/materiel",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">
          Vue d&apos;ensemble de l&apos;activité de l&apos;amicale.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="block">
            <Card className="transition-colors hover:border-primary/40">
              <CardContent>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-3xl font-bold mt-1">{s.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Alerte : réservations du week-end à venir */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Réservations du week-end à venir ({formatDateCourte(samedi)} –{" "}
            {formatDateCourte(dimanche)})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reservationsWeekend.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucune réservation prévue ce week-end.
            </p>
          ) : (
            <ul className="space-y-3">
              {reservationsWeekend.map((r) => (
                <li
                  key={r.id}
                  className="flex items-start justify-between gap-4 border-b border-border last:border-0 pb-3 last:pb-0"
                >
                  <div>
                    <Link
                      href={`/espace/reservations/${r.id}`}
                      className="font-medium text-sm hover:text-primary"
                    >
                      {r.user.prenom} {r.user.nom}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Du {formatDateCourte(r.dateDebut)} au{" "}
                      {formatDateCourte(r.dateFin)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {r.items
                        .map((it) => `${it.quantite} × ${it.equipment.nom}`)
                        .join(", ")}
                    </p>
                  </div>
                  <StatusBadge
                    status={r.statut as ReservationStatus}
                    label={STATUS_LABELS[r.statut as ReservationStatus]}
                  />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
