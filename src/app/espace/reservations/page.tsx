import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import {
  STATUS_LABELS,
  RESERVATION_STATUS,
  type ReservationStatus,
} from "@/lib/constants";
import { formatDateCourte, formatEuros } from "@/lib/utils";
import { parseDateInput, todayInput } from "@/lib/dates";

export const metadata: Metadata = {
  title: "Mes réservations",
};

type ReservationWithItems = Awaited<
  ReturnType<typeof getReservations>
>[number];

async function getReservations(userId: string) {
  return prisma.reservation.findMany({
    where: { userId },
    include: { items: { include: { equipment: true } } },
    orderBy: { dateDebut: "desc" },
  });
}

function ReservationCard({ r }: { r: ReservationWithItems }) {
  const cautionTotale = r.items.reduce(
    (sum, it) => sum + it.quantite * (it.equipment.caution ?? 0),
    0,
  );
  return (
    <Link href={`/espace/reservations/${r.id}`} className="block">
      <Card className="transition-colors hover:border-primary/40">
        <CardContent>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="font-medium">
                Du {formatDateCourte(r.dateDebut)} au{" "}
                {formatDateCourte(r.dateFin)}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {r.items.length} matériel{r.items.length > 1 ? "s" : ""}
                {cautionTotale > 0 &&
                  ` · caution ${formatEuros(cautionTotale)}`}
              </p>
            </div>
            <StatusBadge
              status={r.statut as ReservationStatus}
              label={STATUS_LABELS[r.statut as ReservationStatus]}
            />
          </div>
          <ul className="mt-3 text-sm text-muted-foreground">
            {r.items.map((it) => (
              <li key={it.id}>
                {it.quantite} × {it.equipment.nom}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const { success } = await searchParams;
  const session = await auth();
  const reservations = await getReservations(session!.user.id);
  const today = parseDateInput(todayInput());

  const aVenir = reservations.filter(
    (r) =>
      r.dateFin >= today && r.statut !== RESERVATION_STATUS.ANNULEE,
  );
  const historique = reservations.filter(
    (r) => r.dateFin < today || r.statut === RESERVATION_STATUS.ANNULEE,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">Mes réservations</h1>
        <Button asChild>
          <Link href="/espace/reserver">+ Nouvelle réservation</Link>
        </Button>
      </div>

      {success && (
        <p className="rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3">
          ✅ Votre réservation a bien été enregistrée. Elle est en attente de
          validation par un administrateur.
        </p>
      )}

      {reservations.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          Vous n&apos;avez aucune réservation pour le moment.
        </Card>
      ) : (
        <div className="space-y-8">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              À venir &amp; en cours
            </h2>
            {aVenir.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucune réservation à venir.
              </p>
            ) : (
              aVenir.map((r) => <ReservationCard key={r.id} r={r} />)
            )}
          </section>

          {historique.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Historique
              </h2>
              {historique.map((r) => (
                <ReservationCard key={r.id} r={r} />
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
