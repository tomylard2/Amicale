import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RESERVATION_STATUS } from "@/lib/constants";
import { parseDateInput, todayInput } from "@/lib/dates";

export default async function EspacePage() {
  const session = await auth();
  const userId = session!.user.id;
  const prenom = session?.user?.name?.split(" ")[0] ?? "";
  const today = parseDateInput(todayInput());

  const [aVenir, enAttente, historique] = await Promise.all([
    prisma.reservation.count({
      where: {
        userId,
        dateFin: { gte: today },
        statut: {
          in: [RESERVATION_STATUS.EN_ATTENTE, RESERVATION_STATUS.CONFIRMEE],
        },
      },
    }),
    prisma.reservation.count({
      where: { userId, statut: RESERVATION_STATUS.EN_ATTENTE },
    }),
    prisma.reservation.count({
      where: { userId, dateFin: { lt: today } },
    }),
  ]);

  const stats = [
    { label: "Réservations à venir", value: aVenir },
    { label: "En attente de validation", value: enAttente },
    { label: "Réservations passées", value: historique },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Bonjour {prenom} 👋</h1>
          <p className="text-muted-foreground mt-1">
            Bienvenue dans votre espace personnel.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/espace/catalogue">Voir le catalogue</Link>
          </Button>
          <Button asChild>
            <Link href="/espace/reserver">Réserver</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-3xl font-bold mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-muted-foreground">
              Retrouvez le détail de vos demandes dans « Mes réservations ».
            </p>
            <Button asChild variant="ghost">
              <Link href="/espace/reservations">Mes réservations →</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
