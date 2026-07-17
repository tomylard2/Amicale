import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BlockedPeriodForm } from "@/components/admin/blocked-form";
import { DeleteBlockedButton } from "@/components/admin/blocked-actions";
import { formatDateCourte } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Indisponibilités",
};

export default async function IndisponibilitesPage() {
  const [periodes, equipements] = await Promise.all([
    prisma.blockedPeriod.findMany({
      include: { equipment: true },
      orderBy: { dateDebut: "asc" },
    }),
    prisma.equipment.findMany({
      where: { isActive: true },
      orderBy: { nom: "asc" },
      select: { id: true, nom: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Indisponibilités</h1>
        <p className="text-muted-foreground mt-1">
          Bloquez des dates pour empêcher toute réservation (manifestation,
          maintenance...).
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ajouter une période</CardTitle>
          </CardHeader>
          <CardContent>
            <BlockedPeriodForm equipements={equipements} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Périodes bloquées ({periodes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {periodes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucune période bloquée.
              </p>
            ) : (
              <ul className="space-y-3">
                {periodes.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-start justify-between gap-4 border-b border-border last:border-0 pb-3 last:pb-0"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        Du {formatDateCourte(p.dateDebut)} au{" "}
                        {formatDateCourte(p.dateFin)}
                      </p>
                      <p className="text-sm text-muted-foreground">{p.motif}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {p.equipment
                          ? `Matériel : ${p.equipment.nom}`
                          : "Tout le matériel"}
                      </p>
                    </div>
                    <DeleteBlockedButton id={p.id} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
